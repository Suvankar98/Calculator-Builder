import { useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const useCalculatorStore = create(
  persist(
    (set) => ({
      components: [],
      addComponent: (component) =>
        set((state) => ({ components: [...state.components, component] })),
      removeComponent: (id) =>
        set((state) => ({
          components: state.components.filter((c) => c.id !== id),
        })),
      updateComponentPosition: (result) =>
        set((state) => {
          if (!result.destination) return state;
          const items = Array.from(state.components);
          const [reorderedItem] = items.splice(result.source.index, 1);
          items.splice(result.destination.index, 0, reorderedItem);
          return { components: items };
        }),
      setComponents: (components) => set({ components }),
    }),
    {
      name: "calculator-storage",
      getStorage: () => localStorage,
    }
  )
);

let componentIdCounter = 0;

const CalculatorBuilder = () => {
  const { components, addComponent, removeComponent, updateComponentPosition } =
    useCalculatorStore();
  const [displayValue, setDisplayValue] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  const handleNumberClick = (number) => {
    setDisplayValue(displayValue + number);
  };

  const handleOperatorClick = (operator) => {
    setDisplayValue(displayValue + operator);
  };

  const handleEqualsClick = () => {
    try {
      const result = eval(displayValue);
      setDisplayValue(result.toString());
    } catch {
      setDisplayValue("error");
    }
  };

  const handleClearClick = () => {
    setDisplayValue("");
  };

  const predefinedComponents = [
    { id: `num-${componentIdCounter++}`, type: "number", value: "7" },
    { id: `num-${componentIdCounter++}`, type: "number", value: "8" },
    { id: `num-${componentIdCounter++}`, type: "number", value: "9" },
    { id: `op-${componentIdCounter++}`, type: "operator", value: "+" },
    { id: `num-${componentIdCounter++}`, type: "number", value: "4" },
    { id: `num-${componentIdCounter++}`, type: "number", value: "5" },
    { id: `num-${componentIdCounter++}`, type: "number", value: "6" },
    { id: `op-${componentIdCounter++}`, type: "operator", value: "-" },
    { id: `num-${componentIdCounter++}`, type: "number", value: "1" },
    { id: `num-${componentIdCounter++}`, type: "number", value: "2" },
    { id: `num-${componentIdCounter++}`, type: "number", value: "3" },
    { id: `op-${componentIdCounter++}`, type: "operator", value: "*" },
    { id: `num-${componentIdCounter++}`, type: "number", value: "0" },
    { id: `eq-${componentIdCounter++}`, type: "equals", value: "=" },
    { id: `clear-${componentIdCounter++}`, type: "clear", value: "C" },
    { id: `op-${componentIdCounter++}`, type: "operator", value: "/" },
    { id: `display-${componentIdCounter++}`, type: "display", value: "" },
  ];

  const handleAddComponent = (component) => {
    addComponent({
      ...component,
      id: `${component.type}-${componentIdCounter++}`,
    });
  };

  const onDragEnd = (result) => {
    updateComponentPosition(result);
  };

  return (
    <div
      className={`p-4 ${
        darkMode ? "bg-gray-800 text-white" : "bg-white"
      } min-h-screen`}
    >
      <h1 className="text-2xl font-bold mb-4">Calculator Builder</h1>

      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
        onClick={() => setDarkMode(!darkMode)}
      >
        {darkMode ? "Light Mode" : "Dark Mode"}
      </button>

      <div className="mb-4">
        <h2>Available Components</h2>
        <div className="flex flex-wrap">
          {predefinedComponents.map((component) => (
            <button
              key={component.id}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2 mb-2"
              onClick={() => handleAddComponent(component)}
            >
              {component.value}
            </button>
          ))}
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="calculator-components" direction="horizontal">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="flex flex-wrap"
            >
              {components.map((component, index) => (
                <Draggable
                  key={component.id}
                  draggableId={component.id}
                  index={index}
                >
                  {(provided) => (
                    <div
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      ref={provided.innerRef}
                      className={`bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded mr-2 mb-2 ${
                        component.type === "display" ? "w-48" : ""
                      }`}
                    >
                      {component.type === "number" ? (
                        <button
                          onClick={() => handleNumberClick(component.value)}
                        >
                          {component.value}
                        </button>
                      ) : component.type === "operator" ? (
                        <button
                          onClick={() => handleOperatorClick(component.value)}
                        >
                          {component.value}
                        </button>
                      ) : component.type === "equals" ? (
                        <button onClick={handleEqualsClick}>
                          {component.value}
                        </button>
                      ) : component.type === "clear" ? (
                        <button onClick={handleClearClick}>
                          {component.value}
                        </button>
                      ) : component.type === "display" ? (
                        <input
                          type="text"
                          value={displayValue}
                          readOnly
                          className="w-full bg-white border border-gray-300 rounded py-2 px-3"
                        />
                      ) : null}
                      <button
                        className="ml-2 text-red-500 hover:text-red-700"
                        onClick={() => removeComponent(component.id)}
                      >
                        x
                      </button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default CalculatorBuilder;
