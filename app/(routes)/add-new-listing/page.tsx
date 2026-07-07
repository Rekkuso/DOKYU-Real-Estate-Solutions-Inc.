import React from "react";
import Header from "../../_components/Header";

function AddNewListing() {
  return (
    <div className="h-screen flex flex-col items-center">
      <Header />
      <div className="p-10 flex flex-col item-center justify-center gap-3 mt-20">
        <h2 className="font-bold text-2xl">Add New Listing</h2>
        <div>
          <h2 className="text-gray-400">
            Enter Address Which You Want To List
          </h2>
          
        </div>
      </div>
    </div>
  );
}

export default AddNewListing;
