import React from 'react'
import PageHeader from '../../components/PageHeader'
import AdminCreateRestaurantForm from '../components/AdminCreateRestaurant'
function AdminCreateRestaurant() {
  return (
	<div className="w-full lg:mt-0 p-4 xs:p-5">
			  <PageHeader
				title="Admin Create Vendor Partner"
				breadcrumbs={[
				  { label: "Admin Create Vendor Partner" },
				  { label: "Vendor Partners", active: true },
				]}
			  />
		<AdminCreateRestaurantForm/>
			 
		
			 
			</div>
  )
}

export default AdminCreateRestaurant