export const registryQueries = {
  people: `SELECT p.person_code AS code,concat_ws(' ',n.prefix_text,n.given_name,n.family_name) AS name,p.row_version AS revision
        FROM private.person p LEFT JOIN LATERAL(SELECT * FROM private.person_name_history WHERE person_id=p.id AND superseded_at IS NULL AND effective_from<=(CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Bangkok')::date AND (effective_to IS NULL OR effective_to>(CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Bangkok')::date) ORDER BY effective_from DESC,recorded_at DESC,id LIMIT 1)n ON true
        WHERE p.is_active AND (p.person_code ILIKE $1 ESCAPE '\\' OR concat_ws(' ',n.prefix_text,n.given_name,n.family_name) ILIKE $1 ESCAPE '\\') ORDER BY p.person_code LIMIT 26 OFFSET $2`,
  organizations: `SELECT o.organization_code AS code,n.display_name AS name,o.row_version AS revision
        FROM private.organization o LEFT JOIN LATERAL(SELECT * FROM private.organization_name_history WHERE organization_id=o.id AND superseded_at IS NULL AND effective_from<=(CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Bangkok')::date AND (effective_to IS NULL OR effective_to>(CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Bangkok')::date) ORDER BY effective_from DESC,recorded_at DESC,id LIMIT 1)n ON true
        WHERE o.is_active AND (o.organization_code ILIKE $1 ESCAPE '\\' OR n.display_name ILIKE $1 ESCAPE '\\') ORDER BY o.organization_code LIMIT 26 OFFSET $2`,
};
