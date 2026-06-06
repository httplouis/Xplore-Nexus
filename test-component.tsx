"use client";

import { useState } from "react";

export default function TestPage({ params }: { params: { id: string } }) {
  const [test, setTest] = useState("hello");
  
  const items = [
    { id: "1", name: "Item 1" },
    { id: "2", name: "Item 2" },
  ] as const;

  return (
    <div className="fixed inset-0">
      <p>{test}</p>
    </div>
  );
}
