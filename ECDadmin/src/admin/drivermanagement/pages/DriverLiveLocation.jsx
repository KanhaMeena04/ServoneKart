import React from 'react'
import PageHeader from '../../components/PageHeader'
import UpdateLocationCard from '../components/LiveLocation'

function DriverLiveLocation() {
  return (
    <div className="w-full bg-white p-6 rounded-lg border">
      <PageHeader
        title="Delivery Partner Live Location"
        breadcrumbs={[
          { label: "Delivery Partner Live Location" },
          { label: "Delivery Partner", active: true }
        ]}
      />
      <UpdateLocationCard/>
    </div>
  )
}

export default DriverLiveLocation