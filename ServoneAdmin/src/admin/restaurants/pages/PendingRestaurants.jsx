import React from 'react'
import PageHeader from '../../components/PageHeader'
import PendingRestaurantTable from '../components/PendingRestaurantTable'
function PendingRestaurants() {
  return (
      <div className="w-full lg:mt-0 p-4 xs:p-5">
          <PageHeader
            title="Pending Vendor Partners List"
            breadcrumbs={[
              { label: "Pending Vendor Partners List" },
              { label: "Vendor Partners", active: true },
            ]}
          />
    
          <PendingRestaurantTable/>
    
          
        </div>
  )
}

export default PendingRestaurants