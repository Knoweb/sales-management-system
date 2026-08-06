package com.knoweb.salesmanagement.projectexecution.repository;

import com.knoweb.salesmanagement.projectexecution.entity.TaskStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TaskStatusHistoryRepository extends JpaRepository<TaskStatusHistory, UUID> {
    List<TaskStatusHistory> findByTaskId(UUID taskId);
}
