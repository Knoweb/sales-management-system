package com.knoweb.salesmanagement.approval.service;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;
import com.knoweb.salesmanagement.approval.entity.BdmApproval;
import com.knoweb.salesmanagement.approval.enums.BdmApprovalStatus;
import com.knoweb.salesmanagement.approval.repository.BdmApprovalRepository;
import com.knoweb.salesmanagement.common.exception.ResourceConflictException;
import com.knoweb.salesmanagement.common.exception.ResourceNotFoundException;
import com.knoweb.salesmanagement.opportunity.entity.SalesOpportunity;
import com.knoweb.salesmanagement.projectbrief.entity.ProjectBrief;
import com.knoweb.salesmanagement.projectbrief.entity.ProjectBriefVersion;
import com.knoweb.salesmanagement.projectbrief.repository.ProjectBriefRepository;
import com.knoweb.salesmanagement.projectbrief.repository.ProjectBriefVersionRepository;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.text.NumberFormat;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class ClientApprovalDocumentService {

    private final ProjectBriefRepository projectBriefRepository;
    private final BdmApprovalRepository bdmApprovalRepository;
    private final ProjectBriefVersionRepository projectBriefVersionRepository;
    private final JsonMapper jsonMapper;

    public ClientApprovalDocumentService(ProjectBriefRepository projectBriefRepository,
                                         BdmApprovalRepository bdmApprovalRepository,
                                         ProjectBriefVersionRepository projectBriefVersionRepository,
                                         JsonMapper jsonMapper) {
        this.projectBriefRepository = projectBriefRepository;
        this.bdmApprovalRepository = bdmApprovalRepository;
        this.projectBriefVersionRepository = projectBriefVersionRepository;
        this.jsonMapper = jsonMapper;
    }

    @Transactional(readOnly = true)
    public byte[] generateClientApprovalDocument(UUID opportunityId) {
        SalesOpportunity opp = projectBriefRepository.findByOpportunityId(opportunityId)
                .map(ProjectBrief::getOpportunity)
                .orElseThrow(() -> new ResourceNotFoundException("Opportunity not found"));

        ProjectBrief brief = projectBriefRepository.findByOpportunityId(opportunityId)
                .orElseThrow(() -> new ResourceNotFoundException("Project Brief not found"));

        List<BdmApproval> approvals = bdmApprovalRepository.findByOpportunityIdOrderByCreatedAtDesc(opportunityId);
        BdmApproval latestApproval = approvals.stream()
                .filter(a -> a.getProjectBrief().getId().equals(brief.getId()))
                .findFirst()
                .orElseThrow(() -> new ResourceConflictException("No BDM approval found for this brief."));

        if (latestApproval.getStatus() != BdmApprovalStatus.APPROVED) {
            throw new ResourceConflictException("Cannot generate document. BDM Approval is not APPROVED.");
        }

        int approvedVersion = latestApproval.getProjectBriefVersionNumber();

        ProjectBriefVersion version = projectBriefVersionRepository
                .findByProjectBriefIdAndVersionNumber(brief.getId(), approvedVersion)
                .orElseThrow(() -> new ResourceNotFoundException("Approved Project Brief version not found."));

        try {
            JsonNode snapshot = jsonMapper.readTree(version.getSnapshot());

            Document document = new Document(PageSize.A4, 40, 40, 40, 40);
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            PdfWriter.getInstance(document, out);

            document.open();

            Color primaryBlue = new Color(37, 99, 235);
            Color textGray = new Color(51, 65, 85);
            Color softGray = new Color(248, 250, 252);
            Color borderGray = new Color(226, 232, 240);
            Color badgeGreenBg = new Color(209, 250, 229);
            Color badgeGreenText = new Color(16, 185, 129);

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, primaryBlue);
            Font subtitleFont = FontFactory.getFont(FontFactory.HELVETICA, 12, textGray);
            Font sectionHeadingFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, primaryBlue);
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, textGray);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10, textGray);
            Font badgeFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, badgeGreenText);

            Paragraph title = new Paragraph("Client Approval Document", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(5);
            document.add(title);
            
            Paragraph subtitle = new Paragraph("Approved Project Brief Summary", subtitleFont);
            subtitle.setAlignment(Element.ALIGN_CENTER);
            subtitle.setSpacingAfter(25);
            document.add(subtitle);

            PdfPTable table = new PdfPTable(2);
            table.setWidthPercentage(100);
            table.setSpacingBefore(10);
            table.setSpacingAfter(25);
            table.setWidths(new float[]{1.5f, 3f});

            addTableRow(table, "Client Name", opp.getClient() != null ? opp.getClient().getName() : "N/A", headerFont, normalFont, softGray, borderGray);
            addTableRow(table, "Opportunity Title", opp.getTitle(), headerFont, normalFont, softGray, borderGray);
            addTableRow(table, "Opportunity Number", opp.getOpportunityNumber(), headerFont, normalFont, softGray, borderGray);
            
            String projectTitle = extractNodeText(snapshot, "projectTitle");
            addTableRow(table, "Project Title", projectTitle, headerFont, normalFont, softGray, borderGray);
            
            // Add Badge Row
            PdfPCell hCell = new PdfPCell(new Phrase("Approval Status", headerFont));
            hCell.setBackgroundColor(softGray);
            hCell.setBorderColor(borderGray);
            hCell.setPadding(8);
            hCell.setPaddingBottom(10);
            
            PdfPCell vCell = new PdfPCell();
            PdfPTable badgeTable = new PdfPTable(1);
            badgeTable.setWidthPercentage(30);
            badgeTable.setHorizontalAlignment(Element.ALIGN_LEFT);
            PdfPCell badgeCell = new PdfPCell(new Phrase("BDM APPROVED", badgeFont));
            badgeCell.setBackgroundColor(badgeGreenBg);
            badgeCell.setBorderColor(badgeGreenBg);
            badgeCell.setPadding(4);
            badgeCell.setPaddingBottom(6);
            badgeCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            badgeTable.addCell(badgeCell);
            
            vCell.addElement(badgeTable);
            vCell.setBorderColor(borderGray);
            vCell.setPadding(6);
            
            table.addCell(hCell);
            table.addCell(vCell);

            addTableRow(table, "Approved Version", "Version " + approvedVersion, headerFont, normalFont, softGray, borderGray);

            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd, yyyy");
            String approvalDate = latestApproval.getDecisionDate() != null ? latestApproval.getDecisionDate().format(formatter) : "N/A";
            addTableRow(table, "BDM Approval Date", approvalDate, headerFont, normalFont, softGray, borderGray);
            addTableRow(table, "Generated Date", OffsetDateTime.now().format(formatter), headerFont, normalFont, softGray, borderGray);

            document.add(table);

            addSection(document, "Business Problem", extractNodeText(snapshot, "businessProblem"), sectionHeadingFont, normalFont, softGray, borderGray);
            addSection(document, "Required Solution", extractNodeText(snapshot, "requiredSolution"), sectionHeadingFont, normalFont, softGray, borderGray);
            
            String techReq = extractNodeText(snapshot, "technicalRequirements");
            if (!techReq.equals("N/A")) {
                addSection(document, "Technical Requirements", techReq, sectionHeadingFont, normalFont, softGray, borderGray);
            }
            
            String expectedBudget = "N/A";
            if (snapshot.has("expectedBudget") && !snapshot.get("expectedBudget").isNull()) {
                double budgetAmount = snapshot.get("expectedBudget").asDouble();
                NumberFormat currencyFormat = NumberFormat.getNumberInstance(Locale.US);
                currencyFormat.setMinimumFractionDigits(2);
                currencyFormat.setMaximumFractionDigits(2);
                expectedBudget = "LKR " + currencyFormat.format(budgetAmount);
            }
            addSection(document, "Expected Budget", expectedBudget, sectionHeadingFont, normalFont, softGray, borderGray);
            
            String expectedDeadline = "N/A";
            if (snapshot.has("expectedDeadline") && !snapshot.get("expectedDeadline").isNull()) {
                try {
                    expectedDeadline = OffsetDateTime.parse(snapshot.get("expectedDeadline").asText()).format(formatter);
                } catch (Exception e) {
                    expectedDeadline = snapshot.get("expectedDeadline").asText();
                }
            }
            addSection(document, "Expected Deadline", expectedDeadline, sectionHeadingFont, normalFont, softGray, borderGray);

            String departments = "N/A";
            if (snapshot.has("requiredDepartments") && snapshot.get("requiredDepartments").isArray()) {
                List<String> deptNames = new ArrayList<>();
                for (JsonNode dept : snapshot.get("requiredDepartments")) {
                    if (dept.has("name") && !dept.get("name").isNull()) {
                        deptNames.add(dept.get("name").asText());
                    }
                }
                if (!deptNames.isEmpty()) {
                    departments = String.join(", ", deptNames);
                }
            }
            addSection(document, "Required Departments", departments, sectionHeadingFont, normalFont, softGray, borderGray);

            addClientConfirmation(document, sectionHeadingFont, normalFont, softGray, borderGray);

            document.close();
            return out.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Error generating Client Approval Document", e);
        }
    }

    private String extractNodeText(JsonNode node, String field) {
        if (node.has(field) && !node.get(field).isNull() && !node.get(field).asText().trim().isEmpty()) {
            return node.get(field).asText().trim();
        }
        return "N/A";
    }

    private void addTableRow(PdfPTable table, String header, String value, Font headerFont, Font normalFont, Color softGray, Color borderGray) {
        PdfPCell headerCell = new PdfPCell(new Phrase(header, headerFont));
        headerCell.setPadding(8);
        headerCell.setPaddingBottom(10);
        headerCell.setBackgroundColor(softGray);
        headerCell.setBorderColor(borderGray);
        
        PdfPCell valueCell = new PdfPCell(new Phrase(value, normalFont));
        valueCell.setPadding(8);
        valueCell.setPaddingBottom(10);
        valueCell.setBorderColor(borderGray);
        
        table.addCell(headerCell);
        table.addCell(valueCell);
    }
    
    private void addSection(Document document, String title, String content, Font headerFont, Font normalFont, Color softGray, Color borderGray) throws DocumentException {
        PdfPTable table = new PdfPTable(1);
        table.setWidthPercentage(100);
        table.setSpacingBefore(0);
        table.setSpacingAfter(20);

        PdfPCell headerCell = new PdfPCell(new Phrase(title.toUpperCase(), headerFont));
        headerCell.setBackgroundColor(softGray);
        headerCell.setBorderColor(borderGray);
        headerCell.setPadding(10);
        headerCell.setPaddingBottom(12);
        table.addCell(headerCell);

        PdfPCell contentCell = new PdfPCell(new Phrase(content, normalFont));
        contentCell.setBorderColor(borderGray);
        contentCell.setBackgroundColor(Color.WHITE);
        contentCell.setPadding(15);
        contentCell.setPaddingBottom(18);
        table.addCell(contentCell);

        document.add(table);
    }

    private void addClientConfirmation(Document document, Font headerFont, Font normalFont, Color softGray, Color borderGray) throws DocumentException {
        PdfPTable table = new PdfPTable(1);
        table.setWidthPercentage(100);
        table.setSpacingBefore(10);
        table.setSpacingAfter(20);
        table.setKeepTogether(true);

        PdfPCell headerCell = new PdfPCell(new Phrase("CLIENT CONFIRMATION", headerFont));
        headerCell.setBackgroundColor(softGray);
        headerCell.setBorderColor(borderGray);
        headerCell.setPadding(10);
        headerCell.setPaddingBottom(12);
        table.addCell(headerCell);

        Paragraph instructions = new Paragraph("By signing below, the client confirms that they have reviewed and accepted the project brief details, scope, budget, and timeline as described in this document.", normalFont);
        instructions.setSpacingAfter(30);

        Paragraph lines = new Paragraph();
        lines.setFont(normalFont);
        lines.add("Name:      ______________________________________________________\n\n\n");
        lines.add("Signature: ______________________________________________________\n\n\n");
        lines.add("Date:        ______________________________________________________\n");

        PdfPCell contentCell = new PdfPCell();
        contentCell.setBorderColor(borderGray);
        contentCell.setBackgroundColor(Color.WHITE);
        contentCell.setPadding(20);
        contentCell.setPaddingBottom(25);
        contentCell.addElement(instructions);
        contentCell.addElement(lines);

        table.addCell(contentCell);

        document.add(table);
    }
}
