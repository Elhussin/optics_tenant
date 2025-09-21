"use client";

import React from "react";
import { ActionButton } from "@/components/ui/buttons";
import { X } from "lucide-react";
import DynamicFormGenerator from "@/components/generate/DynamicFormGenerator";
import Draggable from "react-draggable";
import { useRef } from "react";

interface AddModuleProps {
  onClose: (e: any) => void;
  entity: string;
  title: string;
}

const AddModule: React.FC<AddModuleProps> = ({ onClose, entity, title }) => {

  const nodeRef = useRef(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Draggable handle=".modal-header" nodeRef={nodeRef}>
        <div
          ref={nodeRef}
          className="w-full max-w-2xl h-[80vh] bg-white rounded-2xl shadow-lg flex flex-col"
        >
          {/* الهيدر draggable */}
          <div className="modal-header flex justify-between items-center p-4 border-b cursor-move bg-gray-100">
            <span className="font-semibold"> {title}</span>
            <button onClick={onClose}>X</button>
          </div>

          {/* المحتوى */}
          <div className="flex-1 overflow-y-auto p-6">
            <DynamicFormGenerator
              entity={entity}
              setData={(newCustomer) => onClose(newCustomer)}
            />
          </div>
        </div>
      </Draggable>
    </div>
  );
}



export default AddModule;