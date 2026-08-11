package com.knoweb.salesmanagement.marketingroi.repository;

import com.knoweb.salesmanagement.marketingroi.entity.MarketingCampaign;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface MarketingCampaignRepository extends JpaRepository<MarketingCampaign, UUID>, JpaSpecificationExecutor<MarketingCampaign> {
}
