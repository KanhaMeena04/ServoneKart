import React from 'react'
import PageHeader from '../../components/PageHeader'
import RiderView from '../components/RiderView'

function DriverProfile() {
  return (
    <div className="w-full bg-white p-6 rounded-lg border">
      <PageHeader
        title="Delivery Partner Profile"
        breadcrumbs={[
          { label: "Delivery Partner Profile" },
          { label: "Delivery Partner", active: true }
        ]}
      />
      <RiderView/>
    </div>
  )
}

export default DriverProfile