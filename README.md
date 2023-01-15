# Area and Volume Calculation on 3D Objects

Area and Volume Algorithms on 3D Models
We share two algorithms to calculate the surface area and volume of a specific subsection of a 3D model. 

The first algorithm partitions the area/volume into smaller segmentations and applies raycasting to find the points on the face surface, and then finds an approximate measurement depending on the resolution selected. 

The second algorithm processes the 3D model file to compute the area and volume measurements for the selected region. Since the second algorithm considers every point in the model and therefore has the maximum possible precision.

The area/volume boundaries is defined by a set of points on the 3D space.

We have tested these algorithms to calculate area and volume of regions on 3D facial scans. The code presented in the AreaVolume-Mesh.js file is implemented on the Face Analyzer tool at the Digitized Rhinoplasty website: https://digitized-rhinoplasty.com

