import React, { useEffect, useState } from "react";
import {
  BadgeCheck,
  CheckCircle,
  Edit2,
  Plus,
  Search,
  XCircle,
} from "lucide-react";

import { SkillApi } from "../../services/SkillApi";
import type { Skill } from "../../types/skill";

import { useAuth } from "../../context/AuthContext";
import { PageHeader } from "../../components/PageHeader";
import { Card } from "../../components/Card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/Table";
import {
  EmptyState,
  LoadingState,
} from "../../components/FeedbackStates";
import { StatusBadge } from "../../components/StatusBadge";
import { SkillModal } from "../../components/skills/SkillModal";
import { IconButton } from "../../components/IconButton";

import { Input } from "../../components/Forms";
import { Alert } from "../../components/Alert";

export const SkillsPage: React.FC = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [page, setPage] = useState(0);
  const size = 20;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { user } = useAuth();

  const canManage = user?.permissions.includes("SKILL_CATALOG_MANAGE");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(0);
    }, 400);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  const loadSkills = async (
    currentSearch = "",
    currentPage = 0,
    currentSize = 20,
  ) => {
    try {
      setLoading(true);

      const data = await SkillApi.search(
        currentSearch,
        undefined,
        currentPage,
        currentSize,
      );

      setSkills(data.content || []);
    } catch (error) {
      console.error("Failed to load skills", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadSkills(debouncedSearch, page, size);
  }, [debouncedSearch, page, size]);

  const handleAddSkill = () => {
    setSelectedSkill(null);
    setIsModalOpen(true);
  };

  const handleEditSkill = (skill: Skill) => {
    setSelectedSkill(skill);
    setIsModalOpen(true);
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);

    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await SkillApi.toggleStatus(id);

      showSuccess("Skill status updated successfully");

      await loadSkills(debouncedSearch, page, size);
    } catch (error) {
      console.error("Failed to toggle status", error);
      alert("Failed to update skill status");
    }
  };

  const handleModalSuccess = () => {
    setIsModalOpen(false);

    showSuccess(
      selectedSkill
        ? "Skill updated successfully"
        : "Skill created successfully",
    );

    void loadSkills(debouncedSearch, page, size);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto w-full">
      <PageHeader
        title="Skills Directory"
        description="Manage the global list of employee skills."
        icon={<BadgeCheck size={24} />}
        actionButton={{
          label: "Add Skill",
          show: canManage,
          onClick: handleAddSkill,
          icon: <Plus size={16} />,
        }}
      />

      {successMessage && (
        <Alert variant="success" style={{ marginBottom: "1.5rem" }}>
          {successMessage}
        </Alert>
      )}

      <div className="mb-5">
        <Input
          type="search"
          placeholder="Search by skill code or name..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          style={{
            width: "100%",
            height: "44px",
            paddingLeft: "16px",
            paddingRight: "16px",
            borderRadius: "9px",
          }}
        />
      </div>

      <Card>
        {loading ? (
          <LoadingState message="Loading skills..." />
        ) : skills.length === 0 ? (
          <EmptyState
            icon={<Search size={48} />}
            title="No skills found"
            message="No skills match your criteria."
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Code</TableHeader>
                  <TableHeader>Name</TableHeader>
                  <TableHeader>Status</TableHeader>

                  {canManage && (
                    <TableHeader align="right">Actions</TableHeader>
                  )}
                </TableRow>
              </TableHead>

              <TableBody>
                {skills.map((skill) => (
                  <TableRow key={skill.id}>
                    <TableCell className="font-medium text-gray-900">
                      {skill.code}
                    </TableCell>

                    <TableCell>{skill.name}</TableCell>

                    <TableCell>
                      <StatusBadge
                        status={skill.active ? "Active" : "Inactive"}
                        variant={skill.active ? "success" : "neutral"}
                      />
                    </TableCell>

                    {canManage && (
                      <TableCell align="right">
                        <div className="flex justify-end gap-2">
                          <IconButton
                            icon={<Edit2 size={16} />}
                            title="Edit Skill"
                            onClick={() => handleEditSkill(skill)}
                          />

                          <IconButton
                            icon={
                              skill.active ? (
                                <XCircle size={16} />
                              ) : (
                                <CheckCircle size={16} />
                              )
                            }
                            title={
                              skill.active ? "Deactivate" : "Activate"
                            }
                            onClick={() => handleToggleStatus(skill.id)}
                          />
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {isModalOpen && (
        <SkillModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          skill={selectedSkill}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
};
