# เริ่มโครงการในเครื่อง — บท05

รุ่นเอกสาร1.5 | 3 ตุลาคม2569 | คู่มือสำหรับผู้เริ่มต้น | อ่าน[ADR001](ADR/001-stack.md)เรื่องรุ่น

## 1 รู้จักเครื่องมือและขอบเขต

Nodeเป็นตัวรันโค้ด pnpmติดตั้งแพ็กเกจตามlockfile DockerเปิดPostgreSQLและRedisในเครื่อง VSCodeใช้แก้ไฟล์ workerเป็นตัวรันอีกหน้าต่างที่ใช้โครงการเดียวกับเว็บ

ตรวจเครื่องพัฒนาที่ทำบทนี้จริง: Ubuntu24.04.3 Linuxx86_64 Node24.19.0 เดิมpnpm11.25.0 VSCodecommandมี แต่ไม่มีDockerdaemonและไม่มีสิทธิ์namespace อย่าเข้าใจว่าLinuxนี้คือOSของเครื่องผู้ใช้ ในWindowsให้ใช้หัวข้อ3แทนคำสั่งLinux

บทนี้เปิดหน้าแรกไทยและปิด/appด้วย403ระหว่างยังไม่มีAuth ไม่มีทะเบียนจริง/schema128ตาราง/login/import/ผลสอบ/งบ/Storage/Supabaseconnection/workerjobs/Verceldeploy ใช้ข้อมูลสมมติเท่านั้น PostgreSQLเดี่ยวไม่ใช่Supabase stack; ไม่มีauth.usersจากComposeนี้

## 2 ติดตั้งบนUbuntu24.04 x86_64

### Node24 LTS

เปิดTerminal คำสั่งนี้ดาวน์โหลดรุ่นที่โครงการเลือกและตรวจSHA256ก่อนติดตั้งไว้ในโฟลเดอร์ผู้ใช้ ไม่ใช้Nodeจากaptที่อาจเป็นคนละmajor

```bash
mkdir -p "$HOME/.local/share/node24" "$HOME/.local/bin"
cd /tmp
curl -fLO https://nodejs.org/download/release/v24.19.0/node-v24.19.0-linux-x64.tar.xz
curl -fLO https://nodejs.org/download/release/v24.19.0/SHASUMS256.txt
rg ' node-v24.19.0-linux-x64.tar.xz$' SHASUMS256.txt | sha256sum -c -
tar -xJf node-v24.19.0-linux-x64.tar.xz -C "$HOME/.local/share/node24" --strip-components=1
export PATH="$HOME/.local/share/node24/bin:$HOME/.local/bin:$PATH"
node --version
npm --version
```

ถ้ายังไม่มีrg ใช้ `grep ' node-v24.19.0-linux-x64.tar.xz$' SHASUMS256.txt` แทนบรรทัดrg ผลNodeต้องv24.19.0 บันทึกบรรทัดexportPATHลง~/.bashrcผ่านVSCodeเพื่อใช้หลังเปิดTerminalใหม่ ถ้าchecksumไม่ผ่านหยุดติดตั้งและดาวน์โหลดใหม่ ไม่ข้ามการตรวจ

### pnpm11.28.2

```bash
npm install --global --prefix "$HOME/.local" pnpm@11.28.2
export PATH="$HOME/.local/bin:$PATH"
pnpm --version
```

ผลต้อง11.28.2 ถ้ามีCorepackอยู่แล้วใช้ `corepack pnpm --version` ในโครงการได้ มันอ่านpackageManagerและดึง11.28.2 ไม่ใช้pnpm11.25.0หรือ12แทนโดยแก้enginesให้ผ่าน ไม่ต้องส่งtokenในแชต registryแพ็กเกจที่ใช้อ่านได้สาธารณะ

### DockerEngineและComposeplugin

คำสั่งนี้สำหรับUbuntu24.04บนเครื่องที่ผู้ใช้มีsudoและใช้งานDockerได้จริง ไม่รันในcontainerที่ไม่มีdaemon/namespaceเพราะติดตั้งCLIไม่ได้เพิ่มสิทธิ์kernel

```bash
sudo apt update
sudo apt install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
sudo tee /etc/apt/sources.list.d/docker.sources <<EOF
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: noble
Components: stable
Architectures: amd64
Signed-By: /etc/apt/keyrings/docker.asc
EOF
sudo apt update
apt list --all-versions docker-ce
sudo apt install docker-ce=5:29.8.2-1~ubuntu.24.04~noble docker-ce-cli=5:29.8.2-1~ubuntu.24.04~noble containerd.io docker-buildx-plugin docker-compose-plugin
sudo systemctl start docker
sudo docker run --rm hello-world
sudo docker compose version
```

รุ่นEngine29.8.2มีในรายการทางการขณะตรวจ ถ้ารุ่นแพ็กเกจไม่พบให้ดูรายการaptจริงและบันทึกADRก่อนเลือกทดแทน ไม่ลบDockerหรือvolumeเดิมโดยไม่มีเหตุ หากdockercommandต้องsudo ให้เติมsudoหน้าคำสั่งdockercomposeในคู่มือนี้ การเพิ่มdocker groupให้สิทธิ์สูงจึงไม่เพิ่มอัตโนมัติ

### VSCode

ดาวน์โหลด.debสำหรับx64จาก[VSCodeทางการ](https://code.visualstudio.com/download) แล้วติดตั้ง โดยเลือกไฟล์ที่เพิ่งดาวน์โหลดจากDownloadsจริง ไม่คัดชื่อplaceholderเป็นคำสั่งรัน

```bash
cd "$HOME"
sudo apt install ./Downloads/code*.deb
code --version
```

ให้รันจากโฟลเดอร์ผู้ใช้และDownloadsมีเฉพาะแพ็กเกจVSCodeที่ตั้งใจติดตั้ง ดู[คู่มือLinux](https://code.visualstudio.com/docs/setup/linux) ไม่สั่งติดตั้งextensionsหรือsyncบัญชีที่ไม่ได้เลือก

## 3 ทางเลือกสำหรับWindows11

หัวข้อนี้เป็นทางเลือก ไม่ใช่ผลตรวจว่าเครื่องผู้ใช้เป็นWindows เปิดPowerShellตรวจระบบและเครื่องมือ

```powershell
Get-ComputerInfo | Select-Object OsName, OsVersion
node --version
pnpm --version
docker version
code --version
```

1. ดาวน์โหลดNode24.19.0 .msiจาก[Nodeทางการ](https://nodejs.org/download/release/v24.19.0/) ตามarchitectureเครื่อง ติดตั้งแล้วเปิดPowerShellใหม่ ตรวจnodeversion
2. รัน `npm install --global pnpm@11.28.2` แล้วตรวจ `pnpm --version` หากPowerShellบล็อก.ps1ให้ใช้ `pnpm.cmd` ไม่ลดExecutionPolicyทั้งเครื่อง
3. ดาวน์โหลด[DockerDesktopWindows](https://docs.docker.com/desktop/setup/install/windows-install/) และติดตั้งตามข้อกำหนดWSL2/virtualizationทางการ เปิดDockerDesktopจนEngineพร้อม แล้วรัน `docker run --rm hello-world` และ `docker compose version` ไม่มีความจำเป็นใช้registrytokenกับimagesสาธารณะนี้
4. ดาวน์โหลดVSCodeWindowsจากเว็บทางการและเปิดโฟลเดอร์โครงการ ไม่ใช้sudo/aptในPowerShell

## 4 ติดตั้งสะอาดและเปิดเว็บ

โครงการเดิมมีGitorigin9_gptแต่ยังไม่push localcommits บทนี้ให้ใช้ZIPส่งมอบหรือcheckoutที่มีcommitบท05จริง หากoriginยังไม่มีcommitบท05 การcloneจะยังไม่ได้ชุดไฟล์บทนี้

1. แตกZIPลงโฟลเดอร์ใหม่ เปิดTerminalในรากที่มีpackage.json หากZIPไม่มี.gitให้ `git init -b main` เพื่อให้secrets:checkทำงานได้ ไม่ต้องสร้างremoteหรือpush
2. ตรวจรุ่นแล้วติดตั้งตามlockfile

```bash
node --version
pnpm --version
pnpm install --frozen-lockfile
pnpm env:init
pnpm db:validate
pnpm dev
```

3. เปิด http://localhost:3000 ต้องเห็นหน้าแรกภาษาไทย ใช้Sarabun หาก3000ถูกใช้ ให้หยุดprocessของตนหรือรัน `pnpm dev --port 3001` แล้วเปิดportนั้น
4. เปิดTerminalอีกหน้าต่าง รัน `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm format:check`, `pnpm secrets:check`, `pnpm build` เมื่อbuildผ่านหยุดdevด้วยCtrl+C แล้วรัน `pnpm start` เพื่อทดสอบรุ่นbuild หรือ `pnpm smoke` เพื่อตรวจHTTPอัตโนมัติ27รายการที่พอร์ต3105
5. ทดสอบหน้า `/app`, `/app/admin` ได้403และไม่มีข้อมูลจริง `/หน้าที่ไม่มี`ได้404 ไม่ใช่loginสำเร็จ ทุกTCธุรกิจจากบท02ยังNOT RUN

`pnpm env:init`สร้าง.envพร้อมรหัสผ่านlocalสุ่มแบบไม่แสดงค่า และไม่ทับ.envที่มีแล้ว .env.exampleเป็นplaceholderเท่านั้น Gitignore.envจริงเสมอ ไม่ส่งไฟล์นี้ไปGitHub ZIPหรือแชต เว็บหน้าแรก/buildไม่ต้องDBเปิดและไม่ต้องSupabasekey

## 5 เปิดPostgreSQLและRedisในเครื่อง

บนเครื่องที่Dockerพร้อม หลังenv:initใช้

```bash
docker compose config --quiet
docker compose up -d --wait
docker compose ps
docker compose exec postgres pg_isready -U postgres -d sangha_local
docker compose exec redis redis-cli ping
pnpm worker:check
pnpm worker:dev
```

ผลต้องDBhealthy RedisPONG และworkerตรวจการเชื่อมสำเร็จ ตัวรันยังไม่consumequeueหรือทำงานธุรกิจ เปิดworkerคนละTerminalกับpnpmdev ปิดด้วยCtrl+C หยุดcontainersโดยรักษาข้อมูลด้วย `docker compose down` ไม่เติม-vซึ่งลบvolume ห้ามใช้DBpush/schemaจริงในบท05

พอร์ตbind127.0.0.1สำหรับlocalเท่านั้น ถ้า5432/6379ชนให้แก้POSTGRES_PORT/REDIS_PORTและportในDATABASE_URL/DIRECT_DATABASE_URL/REDIS_URLให้ตรงใน.env แล้วเปิดservicesใหม่ อย่าปิดบริการของคนอื่น credentialComposeใช้bootstrap/readiness ไม่อนุญาตใช้postgres/bypassrlsกับbusinessqueries

DOCKER-05ในเครื่องทำงานครั้งนี้: daemonไม่มี CapEff0 และunshareuid_map Operationnotpermitted จึงตรวจได้เฉพาะComposeconfigด้วยDockerCLI29.8.2/Compose5.6.0แยก ไม่มีหลักฐานpull/up/healthy/volume/PING/SELECT1สำเร็จ ต้องใช้ขั้นตอนข้างบนและบันทึกผลจริงเพื่อปิดgateก่อนบทที่พึ่งDB/Redis/container

## 6 โครงไฟล์และคำสั่ง

| path | ใช้ทำอะไร |
| --- | --- |
| src/app | หน้าแรก layout CSS 404 และbootstrap403พื้นที่ทำงาน |
| src/modules/people–exam-imports | 9โฟลเดอร์บริการตามBLUEPRINT; Excelเรียกทะเบียนexamsเดิม |
| src/server | config/DB/authorizationฝั่งserver บทนี้ไม่มีbusinessquery |
| src/shared | Buttonจากshadcn/uiและutilsต้นทางเดียว |
| prisma/schema.prisma + prisma.config.ts | templatePrisma7 ไม่มีmodels migration0 |
| worker | processแยก readinesslocalและรอ ไม่มีbusinesshandler |
| tests | bootstrapdeny/config/โครงและรุ่นเครื่องมือ ไม่ใช้แทนRLSจริง |
| docs/ADR/001-stack.md | รุ่น เหตุผล API/pathและหลักฐานทางการ |

| คำสั่ง | ผลที่ควรได้ |
| --- | --- |
| pnpm install --frozen-lockfile | ติดตั้งตรงlockfileไม่แก้รุ่น |
| pnpm lint / typecheck | ตรวจโค้ด/ชนิด ไม่มีwarning/error |
| pnpm test | bootstraptestsผ่าน ไม่เป็นUAT/SQLconcurrencytests |
| pnpm format:check | ไฟล์บท05รูปแบบตรงformatter เอกสารบทเก่าไม่formatย้อนหลัง |
| pnpm db:validate | Prisma templateผ่าน; db:generateรอมีmodelsตามบทลงมือ |
| pnpm secrets:check | Gitไม่เห็น.envจริง/secretตามรูปแบบที่ตรวจ ไม่รับรองไม่มีsecretทุกชนิด |
| pnpm check | รวมlint/type/test/format/secret/build ไม่เริ่มDBเอง |

## 7 แก้ปัญหาที่พบบ่อย

- pnpmรุ่นผิด: ใช้11.28.2หรือcorepack pnpmในโครงการ ไม่แก้lockfileเพื่อให้รุ่นเดิมผ่าน
- Ignoredbuildscripts: ตรวจแพ็กเกจ/รุ่นแล้วปรับallowBuildsในpnpm-workspace.yamlตามADR ไม่เปิดdangerouslyAllowAllBuilds
- buildหาfontไม่เจอ: ฟอนต์เป็นแพ็กเกจlocal ตรวจfrozeninstall ไม่ต้องGoogleFontsnetwork
- Dockerconnectiondenied: ตรวจEngineจริงและสิทธิ์ระบบ การมีCLIไม่ใช่daemonready ถ้าruntimeไม่อนุญาตnamespaceให้ใช้เครื่องพัฒนาที่รองรับและบันทึกblocker
- Prismaไม่มีmodels: เป็นขอบเขตบท05 ไม่เพิ่มตารางจริงให้generatorผ่านก่อนพรอมป์ต์บทschema
- ยังไม่เห็นระบบธุรกิจ/ล็อกอิน: บทนี้ตั้งเครื่องมือเท่านั้น ไม่มีform/loginจำลองและไม่มีข้อมูลจริง

ผลที่รันจริง คำสั่ง ข้อจำกัด และบทถัดไปอยู่ใน[PROGRESS](PROGRESS.md) การคงQ001–Q025เปิดไม่ขวางstarter แต่ไม่อนุญาตกฎจำลองเป็นกฎทางการ

## 8 ผลตรวจขอบเขตเว็บและสิ่งที่ยังค้าง

การทดสอบHTTPของsmokeเรียกหน้าแรก/CSS/ฟอนต์จริง และ/app /app/admin /app/exams/importsด้วยGET POST PUT PATCH DELETE OPTIONS HEAD ได้403/no-store รวม404หนึ่งหน้า ไม่มีข้อสรุปAuth/RLSหรือbusinessAPIจากการทดสอบนี้ Node--importtsxไม่สร้างIPCsocketแบบtsxCLIจึงใช้ในtest/workerให้ตรงทั้งเครื่องพัฒนาและcleaninstall

จากcleanfolderที่ไม่มีnode_modules/.env/.next ติดตั้งfrozenlockfileแล้วตรวจคำสั่งได้ตามPROGRESS ใช้dependencycacheกลางตามปกติ ไม่อ้างว่าทดสอบOS/architectureอื่นหรือcontainerจริง แบบร่างบท03ยังค้างBROWSER-03 ไม่ใช้HTTPsmokeแทนการตรวจภาพ/focus/mobileของต้นแบบนั้น
