package com.knoweb.salesmanagement.notification.repository;

import com.knoweb.salesmanagement.notification.entity.NotificationDeliveryAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface NotificationDeliveryAttemptRepository extends JpaRepository<NotificationDeliveryAttempt, UUID> {
}
