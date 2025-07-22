'use client';

import { useEffect, useRef } from 'react';
import { getChainPoem } from '../utils/poemMapping';
import { getChainSurface } from '../utils/surfaceMapping';

const ProteinViewer = () => {
  // Hardcoded toggle for rotation display - set to false for demos
  const showRotationDisplay = false;
  
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stageRef = useRef<any>(null);

    useEffect(() => {
        const loadProtein = async () => {
            if (!containerRef.current) return;

            const NGL = await import('ngl');

                  // Create NGL stage with expanded picking threshold
      const stage = new NGL.Stage(containerRef.current, {
        backgroundColor: 'black'
      });
      
      // Remove the default hover tooltip behavior
      stage.mouseControls.remove("hoverPick");
      
      // Remove click behaviors that auto-center/jump the view
      stage.mouseControls.remove("clickPick-middle");
      stage.mouseControls.remove("doubleClick");

            stageRef.current = stage;

            try {
                        // Load the protein structure
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const component = await stage.loadFile('/pdb/5hlr.cif') as any;

                        // Add a cartoon representation
        component.addRepresentation('cartoon', {
          color: 'chainname'
        });
        
        // Add invisible larger representations for better hover detection
        component.addRepresentation('spacefill', {
          color: 'chainname',
          opacity: 0,  // Completely invisible
          radius: 3.0, // Much larger than atoms
          visible: false
        });

                // Center and zoom to fit
                component.autoView();

                // Zoom in a bit more for a closer initial view
                stage.viewerControls.zoom(0.6);

                // Set exact rotation matrix to your preferred orientation
                const customRotation = new NGL.Matrix4().fromArray([
                  -66.948, -12.476, 48.038, 0.000,
                  -38.966, -36.748, -63.848, 0.000,
                  30.741, -73.751, 23.688, 0.000,
                  -81.246, -64.681, -69.356, 1.000
                ]);
                
                // Apply your preferred orientation
                stage.viewerControls.orient(customRotation);

                // Make the whole scene spin around the y-axis
                //stage.setSpin(true);

                                 // Create tooltip for hover information
                 const tooltip = document.createElement("div");
                 Object.assign(tooltip.style, {
                   display: "none",
                   position: "fixed",
                   zIndex: "10",
                   pointerEvents: "none",
                   backgroundColor: "rgba(0, 0, 0, 0.8)",
                   color: "white",
                   padding: "8px 12px",
                   borderRadius: "4px",
                   fontFamily: "sans-serif",
                   fontSize: "14px",
                   border: "1px solid rgba(255, 255, 255, 0.3)"
                 });
                 document.body.appendChild(tooltip);
                 
                 // Create rotation display for debugging positioning
                 const rotationDisplay = document.createElement("div");
                 Object.assign(rotationDisplay.style, {
                   position: "fixed",
                   top: "10px",
                   left: "10px",
                   zIndex: "20",
                   backgroundColor: "rgba(0, 0, 0, 0.8)",
                   color: "white",
                   padding: "10px",
                   borderRadius: "4px",
                   fontFamily: "monospace",
                   fontSize: "12px",
                   border: "1px solid rgba(255, 255, 255, 0.3)"
                 });
                 document.body.appendChild(rotationDisplay);
                 
                 // Update rotation display continuously
                 const updateRotationDisplay = () => {
                   if (!showRotationDisplay) {
                     rotationDisplay.style.display = 'none';
                     return;
                   }
                   rotationDisplay.style.display = 'block';
                   const orientation = stage.viewerControls.getOrientation();
                   const matrix = orientation.elements || orientation;
                   rotationDisplay.innerHTML = `
                     <strong>Current Rotation:</strong><br/>
                     [${matrix[0]?.toFixed(3)}, ${matrix[1]?.toFixed(3)}, ${matrix[2]?.toFixed(3)}, ${matrix[3]?.toFixed(3)}]<br/>
                     [${matrix[4]?.toFixed(3)}, ${matrix[5]?.toFixed(3)}, ${matrix[6]?.toFixed(3)}, ${matrix[7]?.toFixed(3)}]<br/>
                     [${matrix[8]?.toFixed(3)}, ${matrix[9]?.toFixed(3)}, ${matrix[10]?.toFixed(3)}, ${matrix[11]?.toFixed(3)}]<br/>
                     [${matrix[12]?.toFixed(3)}, ${matrix[13]?.toFixed(3)}, ${matrix[14]?.toFixed(3)}, ${matrix[15]?.toFixed(3)}]
                   `;
                 };
                 
                 // Update rotation display every 100ms
                 setInterval(updateRotationDisplay, 100);
                 
                 // Track mouse position for tooltip
                 let mouseX = 0;
                 let mouseY = 0;
                 // eslint-disable-next-line @typescript-eslint/no-explicit-any
                 let currentHighlight: any = null;
                 let currentHighlightChain: string | null = null;
                 
                 containerRef.current.addEventListener('mousemove', function(event: MouseEvent) {
                   mouseX = event.clientX;
                   mouseY = event.clientY;
                 });
                 
                 // Hide tooltip when mouse leaves the protein viewer container
                 containerRef.current.addEventListener('mouseleave', function() {
                   // Reset cursor when leaving the container
                   containerRef.current!.style.cursor = 'default';
                   
                   tooltip.style.display = "none";
                   
                   // Also remove any highlight when leaving the container
                   if (currentHighlight) {
                     component.removeRepresentation(currentHighlight);
                     currentHighlight = null;
                     currentHighlightChain = null;
                   }
                 });
                 
                 // Add hover functionality to show chain/segment info and highlight
                 // eslint-disable-next-line @typescript-eslint/no-explicit-any
                 stage.signals.hovered.add(function (pickingProxy: any) {
                   if (pickingProxy && pickingProxy.atom) {
                     const atom = pickingProxy.atom;
                     const chainName = atom.chainname;
                     
                     // Change cursor to help when hovering over protein
                     containerRef.current!.style.cursor = 'help';
                     
                     // Show tooltip with poem segment
                     tooltip.innerText = getChainPoem(chainName);
                     tooltip.style.top = mouseY + 10 + "px";
                     tooltip.style.left = mouseX + 10 + "px";
                     tooltip.style.display = "block";
                     
                     // Add highlight if it's a different chain
                     if (currentHighlightChain !== chainName) {
                       // Remove previous highlight
                       if (currentHighlight) {
                         component.removeRepresentation(currentHighlight);
                       }
                       
                                                // Add new surface highlight for this chain
                         currentHighlight = component.addRepresentation(getChainSurface(chainName), {
                           sele: `:${chainName}`,
                           color: 'white',
                           opacity: 0.3,
                           surfaceType: 'av'  // accessible volume surface
                         });
                       
                       currentHighlightChain = chainName;
                     }
                   } else {
                     // Reset cursor to default when not hovering over protein
                     containerRef.current!.style.cursor = 'default';
                     
                     // Hide tooltip and remove highlight
                     tooltip.style.display = "none";
                     
                     if (currentHighlight) {
                       component.removeRepresentation(currentHighlight);
                       currentHighlight = null;
                       currentHighlightChain = null;
                     }
                   }
                 });

            } catch (error) {
                console.error('Error loading protein:', error);
            }
        };

        loadProtein();

        // Cleanup
        return () => {
            if (stageRef.current) {
                stageRef.current.dispose();
            }
        };
    }, [showRotationDisplay]);

      return (
          <div 
        ref={containerRef} 
        className="w-full h-full"
        style={{ minHeight: '500px' }}
      />
  );
};

export default ProteinViewer; 