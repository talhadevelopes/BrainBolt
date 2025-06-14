import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ModuleData } from '../Data/moduleData';
import { Atom, RotateCcw, ZoomIn, Ruler, Eye } from 'lucide-react';

interface ThreeDExplorerModuleProps {
  module: ModuleData;
}

const ThreeDExplorerModule: React.FC<ThreeDExplorerModuleProps> = ({ module }) => {
  const [selectedMolecule, setSelectedMolecule] = useState(0);
  const [selectedTool, setSelectedTool] = useState('Rotate');
  const [rotationX, setRotationX] = useState(0);
  const [rotationY, setRotationY] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [showOrbitals, setShowOrbitals] = useState(false);

  const molecules = module.content.molecules;
  const molecule = molecules[selectedMolecule];
  const tools = module.content.tools;

  const handleMouseMove = (e: React.MouseEvent) => {
    if (selectedTool === 'Rotate') {
      const rect = e.currentTarget.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const mouseX = e.clientX - centerX;
      const mouseY = e.clientY - centerY;
      
      setRotationY(mouseX * 0.5);
      setRotationX(-mouseY * 0.5);
    }
  };

  const renderAtom = (atom: any, index: number) => {
    const colors: { [key: string]: string } = {
      'C': '#404040',
      'H': '#ffffff',
      'O': '#ff4444',
      'N': '#4444ff'
    };

    return (
      <motion.div
        key={index}
        className="absolute w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
        style={{
          backgroundColor: colors[atom.element] || '#888888',
          color: atom.element === 'H' ? '#000' : '#fff',
          left: `${50 + atom.position[0] * 10 * zoom}%`,
          top: `${50 + atom.position[1] * 10 * zoom}%`,
          transform: `rotateX(${rotationX}deg) rotateY(${rotationY}deg)`,
        }}
        whileHover={{ scale: 1.2 }}
      >
        {atom.element}
      </motion.div>
    );
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Molecule List */}
        <div className="lg:col-span-1">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Atom size={20} className="text-green-400" />
            Molecules
          </h3>
          <div className="space-y-3">
            {molecules.map((mol: any, index: number) => (
              <motion.div
                key={mol.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-4 rounded-lg cursor-pointer transition-all ${
                  selectedMolecule === index
                    ? 'bg-green-600/20 border-2 border-green-500'
                    : 'bg-gray-700/30 hover:bg-gray-600/40 border border-gray-600'
                }`}
                onClick={() => setSelectedMolecule(index)}
              >
                <h4 className="font-bold text-white text-sm mb-2">{mol.name}</h4>
                <p className="text-green-400 font-mono text-sm mb-2">{mol.formula}</p>
                <div className="flex justify-between items-center">
                  <span className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded text-xs">
                    {mol.structureType}
                  </span>
                  <span className="text-xs text-gray-400">
                    {mol.atoms.length} atoms
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Tools */}
          <div className="mt-6">
            <h4 className="text-lg font-bold text-white mb-3">Tools</h4>
            <div className="grid grid-cols-2 gap-2">
              {tools.map((tool: any, index: number) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedTool(tool.name)}
                  className={`p-3 rounded-lg text-center transition-all ${
                    selectedTool === tool.name
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-300'
                  }`}
                >
                  <div className="text-lg mb-1">{tool.icon}</div>
                  <div className="text-xs font-medium">{tool.name}</div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* 3D Viewer */}
        <div className="lg:col-span-2">
          <div className="bg-gray-800/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xl font-bold text-white">{molecule.name}</h4>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowOrbitals(!showOrbitals)}
                  className={`p-2 rounded-lg ${
                    showOrbitals ? 'bg-purple-600' : 'bg-gray-600'
                  } text-white`}
                >
                  <Eye size={16} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setRotationX(0);
                    setRotationY(0);
                    setZoom(1);
                  }}
                  className="p-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white"
                >
                  <RotateCcw size={16} />
                </motion.button>
              </div>
            </div>

            {/* 3D Visualization Area */}
            <div 
              className="relative bg-black rounded-lg h-96 overflow-hidden cursor-grab active:cursor-grabbing"
              onMouseMove={handleMouseMove}
              style={{ perspective: '1000px' }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div 
                  className="relative w-full h-full"
                  style={{
                    transform: `rotateX(${rotationX}deg) rotateY(${rotationY}deg) scale(${zoom})`,
                    transformStyle: 'preserve-3d',
                    transition: 'transform 0.1s ease-out'
                  }}
                >
                  {/* Render atoms */}
                  {molecule.atoms.map((atom: any, index: number) => renderAtom(atom, index))}
                  
                  {/* Render bonds */}
                  {molecule.bonds.map((bond: any, index: number) => {
                    const atom1 = molecule.atoms[bond.atoms[0]];
                    const atom2 = molecule.atoms[bond.atoms[1]];
                    
                    return (
                      <div
                        key={`bond-${index}`}
                        className="absolute bg-gray-400 rounded-full opacity-70"
                        style={{
                          width: '2px',
                          height: `${bond.length * 20 * zoom}px`,
                          left: `${50 + atom1.position[0] * 10 * zoom}%`,
                          top: `${50 + atom1.position[1] * 10 * zoom}%`,
                          transformOrigin: 'top center',
                          transform: `rotateX(${rotationX}deg) rotateY(${rotationY}deg) rotateZ(${Math.atan2(
                            atom2.position[1] - atom1.position[1],
                            atom2.position[0] - atom1.position[0]
                          ) * 180 / Math.PI}deg)`
                        }}
                      />
                    );
                  })}

                  {/* Orbitals overlay */}
                  {showOrbitals && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.3 }}
                      className="absolute inset-0"
                    >
                      {molecule.atoms.map((atom: any, index: number) => (
                        <div
                          key={`orbital-${index}`}
                          className="absolute border-2 border-purple-400 rounded-full"
                          style={{
                            width: '40px',
                            height: '40px',
                            left: `${50 + atom.position[0] * 10 * zoom - 20}%`,
                            top: `${50 + atom.position[1] * 10 * zoom - 20}%`,
                            transform: `rotateX(${rotationX}deg) rotateY(${rotationY}deg)`,
                          }}
                        />
                      ))}
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Tool overlay */}
              <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg p-2">
                <p className="text-white text-sm">Active Tool: {selectedTool}</p>
              </div>
            </div>

            {/* Controls */}
            <div className="mt-4 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <ZoomIn size={16} className="text-gray-400" />
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-20 accent-blue-600"
                />
                <span className="text-gray-400 text-sm">{zoom.toFixed(1)}x</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Ruler size={16} className="text-gray-400" />
                <span className="text-gray-400 text-sm">
                  Rotation: X{rotationX.toFixed(0)}° Y{rotationY.toFixed(0)}°
                </span>
              </div>
            </div>

            {/* Properties Panel */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-900/50 p-4 rounded-lg">
                <h5 className="font-bold text-white mb-3">Properties</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Molecular Weight:</span>
                    <span className="text-white">{molecule.properties.molecularWeight} g/mol</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Density:</span>
                    <span className="text-white">{molecule.properties.density} g/cm³</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Melting Point:</span>
                    <span className="text-white">{molecule.properties.meltingPoint}°C</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Boiling Point:</span>
                    <span className="text-white">{molecule.properties.boilingPoint}°C</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900/50 p-4 rounded-lg">
                <h5 className="font-bold text-white mb-3">Functional Groups</h5>
                <div className="flex flex-wrap gap-2">
                  {molecule.functionalGroups.map((group: string, index: number) => (
                    <span
                      key={index}
                      className="bg-green-600/20 text-green-400 px-2 py-1 rounded-full text-xs"
                    >
                      {group}
                    </span>
                  ))}
                </div>
                <h5 className="font-bold text-white mt-4 mb-2">Isomers</h5>
                <div className="text-sm text-gray-300">
                  {molecule.isomers.join(', ')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Statistics */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        {module.content.categories.map((category: any, index: number) => (
          <div key={index} className="bg-gray-800/30 p-4 rounded-lg">
            <h5 className="font-bold text-white">{category.name}</h5>
            <p className="text-gray-400 text-sm">{category.moleculeCount} molecules</p>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{ width: `${(category.moleculeCount / 50) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ThreeDExplorerModule;