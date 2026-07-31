package com.knoweb.salesmanagement.projectbrief.util;

import com.knoweb.salesmanagement.projectbrief.entity.ProjectBrief;
import com.knoweb.salesmanagement.projectbrief.enums.ProjectBriefStatus;

import java.time.Duration;
import java.time.OffsetDateTime;

public class ProjectBriefDeadlineUtil {

    public static boolean isOverdue(ProjectBrief brief) {
        if (brief.getDueAt() == null || brief.getStatus() != ProjectBriefStatus.DRAFT) {
            return false;
        }
        return OffsetDateTime.now().isAfter(brief.getDueAt());
    }

    public static Long calculateOverdueHours(ProjectBrief brief) {
        if (brief.getDueAt() == null) return null;
        
        if (brief.getStatus() == ProjectBriefStatus.DRAFT) {
            if (!isOverdue(brief)) return 0L;
            return Duration.between(brief.getDueAt(), OffsetDateTime.now()).toHours();
        } else if (brief.getSubmittedAt() != null) {
            if (brief.getSubmittedAt().isAfter(brief.getDueAt())) {
                return Duration.between(brief.getDueAt(), brief.getSubmittedAt()).toHours();
            }
        }
        return 0L;
    }

    public static String calculateDeadlineStatus(ProjectBrief brief) {
        if (brief.getDueAt() == null) return "UNKNOWN";
        
        if (brief.getStatus() != ProjectBriefStatus.DRAFT && brief.getSubmittedAt() != null) {
            if (brief.getSubmittedAt().isAfter(brief.getDueAt())) {
                return "SUBMITTED_LATE";
            } else {
                return "SUBMITTED_ON_TIME";
            }
        }
        
        OffsetDateTime now = OffsetDateTime.now();
        if (now.isAfter(brief.getDueAt())) {
            return "OVERDUE";
        } else if (now.plusHours(24).isAfter(brief.getDueAt())) {
            return "DUE_SOON";
        }
        return "ON_TIME";
    }
}
