"use client";

import React from "react";
import Header from "./_components/Header";

function Provider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}

export default Provider;
