import React, { useEffect, useState } from 'react'
import CreateProduct from './CreateProduct'

const CategoriesButton = ({ categoryName, setSelectedCategory}) => {
const [openModal, setOpenModal] = useState(false)

const handleCloseModal = () => {
  setOpenModal(false)
}


  return (
      <>
      <div className="menu-header">
          <h1>Menu</h1>
          <button className='createproduct' onClick={() => {setOpenModal(true)}}> Create New Product
        </button>
      {openModal ? <CreateProduct handleCloseModal={handleCloseModal} /> : <></> }
        </div>
        <div className="menu-categories">
          {categoryName.map((category, index) => (
            <div className="category" key={index} onClick={() => {setSelectedCategory(category)} }>{category}</div>
          ))}
        </div>
        </>
  )
}

export default CategoriesButton
