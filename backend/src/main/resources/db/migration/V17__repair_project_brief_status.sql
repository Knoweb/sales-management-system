UPDATE project_briefs pb
SET status = 'BDM_APPROVED'
FROM bdm_approvals ba
WHERE ba.project_brief_id = pb.id
  AND ba.status = 'APPROVED'
  AND ba.project_brief_version_number = pb.current_version_number
  AND pb.status != 'BDM_APPROVED';
