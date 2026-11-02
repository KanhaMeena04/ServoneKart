import React, { useState } from "react";
import PageHeader from "../../components/PageHeader";
import PageActionBar from "../../components/PageActionBar";
import { useNavigate } from "react-router-dom";
import PendingRiderTable from "../components/PendingRiderTable";

export default function PendingDriverList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="bg-white border rounded-lg p-6 w-full">
      <PageHeader
        title="Pending Delivery Partner Verification"
        breadcrumbs={[
          { label: "Pending Delivery Partners" },
          { label: "Delivery Partners", active: true }
        ]}
      />
      
      <PageActionBar
        buttonLabel="Add Delivery Partner"   
        onButtonClick={() => navigate("/admin-create-driver")} 
        searchLabel="Delivery Partners"
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <PendingRiderTable searchQuery={searchQuery} />
    </div>
  );
}
