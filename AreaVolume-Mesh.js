

//findAreaOrVolume that doesn't use raycasting
function findAreaOrVolume(mId, isVolume){
    
    var avg_area = 0, min_area = 0, max_area = 0, weighted_area = 0;
    var avg_volume = 0, min_volume = 0, max_volume = 0, weighted_volume = 0;
    var current_date = new Date(); //For performance analysis
    var current_millis = current_date.getTime();
    var total_points = 0;

    //Find the minimum and maximum x and y points to quickly skip over points outside the region
    var min_x, min_y, max_x, max_y; //These are the maximums among the feature points
    //var feature_center = {x:0, y:0, z:0};
    var feature_points = []; //Stored here for formatting reasons
    for(var a = 0; a < mId.usedFeatures.length; a ++){
        if(measurementPoints[a] == "" || measurementPoints[a].xVal == ""){
            return; //Make sure all points are defined
        }
        if(min_x === undefined || measurementPoints[a].xVal < min_x){ min_x = measurementPoints[a].xVal; }
        if(max_x === undefined || measurementPoints[a].xVal > max_x){ max_x = measurementPoints[a].xVal; }
        if(min_y === undefined || measurementPoints[a].yVal < min_y){ min_y = measurementPoints[a].yVal; }
        if(max_y === undefined || measurementPoints[a].yVal > max_y){ max_y = measurementPoints[a].yVal; }
        feature_points.push({x: measurementPoints[a].xVal, y: measurementPoints[a].yVal, z: measurementPoints[a].zVal});
    }

    //If its V5H3, we need to define the corner points
    //Vertical_Fifths_Horizontal_Thirds_Area is a rectangle shape and has 4 points that defines its borders
    if(mId.id === "Vertical_Fifths_Horizontal_Thirds_Area" || mId.id === "Vertical_Fifths_Horizontal_Thirds_Volume"){
        //0 and 2 are left and right, 1 and 3 are top and bottom
        var p0 = {x: feature_points[1].x,  y: feature_points[2].y,  z: feature_points[1].z};
        var p1 = {x: feature_points[3].x,  y: feature_points[2].y,  z: feature_points[3].z};
        var p2 = {x: feature_points[3].x,  y: feature_points[0].y,  z: feature_points[3].z};
        var p3 = {x: feature_points[1].x,  y: feature_points[0].y,  z: feature_points[1].z};
        feature_points[0] = get_projection_point(p0, {x:p0.x, y:p0.y, z:p0.z*2});
        feature_points[1] = get_projection_point(p1, {x:p1.x, y:p1.y, z:p1.z*2});
        feature_points[2] = get_projection_point(p2, {x:p2.x, y:p2.y, z:p2.z*2});
        feature_points[3] = get_projection_point(p3, {x:p3.x, y:p3.y, z:p3.z*2});
    }

    //Find the center of the feature points
    //Right between the first point and the middle point
    var middle_point = feature_points[Math.floor(feature_points.length/2)];
    var feature_center = {x: (feature_points[0].x+middle_point.x)/2, y: (feature_points[0].y+middle_point.y)/2, z: (feature_points[0].z+middle_point.z)/2};

    //Iterate over all the triangles of the face
    //I don't think we're storing the face mesh so I made a function to find it
    var realFace = getFaceMesh();
    var points = realFace.geometry.getAttribute('position').array;

    //Find min_z
    var min_z; //Minimum over ALL points in region
    for(var a = 0; a < points.length; a += 3){
        if(points[a] >= min_x && points[a] <= max_x && points[a+1] >= min_y && points[a+1] <= max_y){
            if(pointInRegion({x: points[a], y: points[a+1], z: points[a+2]}, feature_points, feature_center)){
                if(points[a+2] < min_z || min_z === undefined){
                    min_z = points[a+2];
                }
            }
        }
    }
    //Nine elements of the point array make up each triangle: p1's (x,y,z), then p2 and p3
    //Iterate over each triangle to find the areas
    for(var a = 0; a < points.length; a += 9){
        //Iterate over each point in this triangle to see how many points are in the region
        var inCount = 0;
        for(var b = a; b < a+9; b += 3){
            if(points[b] >= min_x && points[b] <= max_x && points[b+1] >= min_y && points[b+1] <= max_y){
                if(pointInRegion({x: points[b], y: points[b+1], z: points[b+2]}, feature_points, feature_center)){
                    inCount ++;
                }
            }
        }
        //Add up the total area and volume from this triangle
        if(inCount > 0){
            //Define surface and base points
            var surf1 = {x: points[a+0], y: points[a+1], z: points[a+2]};
            var surf2 = {x: points[a+3], y: points[a+4], z: points[a+5]};
            var surf3 = {x: points[a+6], y: points[a+7], z: points[a+8]};
            var base1 = {x: points[a+0], y: points[a+1], z: min_z};
            var base2 = {x: points[a+3], y: points[a+4], z: min_z};
            var base3 = {x: points[a+6], y: points[a+7], z: min_z};

            var temp_area = triangle_area(surf1, surf2, surf3);
            var temp_volume = 0;
            temp_volume += tetrahedron_volume(surf1, surf2, surf3, base1);
            temp_volume += tetrahedron_volume(surf2, surf3, base1, base2);
            temp_volume += tetrahedron_volume(surf3, base1, base2, base3);
            max_area += temp_area;
            max_volume += temp_volume;
            if(inCount === 3){
                min_area += temp_area;
                min_volume += temp_volume;
            }
            weighted_area += (inCount/3) * temp_area;
            weighted_volume += (inCount/3) * temp_volume;
            total_points += inCount; //Many of these will be counted multiple times
        }
    }
    avg_area = (min_area + max_area) / 2;
    avg_volume = (min_volume + max_volume) / 2;

    current_date = new Date();
    var time_elapsed = current_date.getTime() - current_millis;
    console.log("Time: "+time_elapsed);
    console.log("Points: "+total_points);
    return {a_val: avg_area.toFixed(2), v_val: avg_volume.toFixed(2), points: total_points, time: time_elapsed}; //For generating CSV for measurement data
}


/*
 The function get_projection_point takes in two parameters: "point" and "origin".
 This function's purpose is to find the point at which a ray cast from origin to point will intersect an object in a scene. It checks if the intersection is not a sphere, or if it's not a mesh.
 It returns the point of intersection.

 The function uses the Three.js library, which is a JavaScript 3D library, to create a raycast, which is a line that is cast out into the 3D scene to determine where it intersects with an object.

 The "point" parameter is an object with x, y, and z properties representing a point in 3D space.
 */
function get_projection_point(point, origin){
    //Where does the ray from (0, 0, 0) to (point.x, point.y, point.z) intersect the model? (by default)
    //You can also do a custom origin, that's optional
    //return {x: point.x, y: point.y, z: point.z}; //To test speed without raycast
    var origin_vector;
    if(origin === undefined){
        //By default, it's super far out and facing the origin
        origin_vector = new THREE.Vector3(point.x, point.y, point.z);
        origin_vector.normalize();
        origin_vector.multiplyScalar(3000);
    }
    else{
        origin_vector = new THREE.Vector3(origin.x, origin.y, origin.z);
    }
    var direction_vector = new THREE.Vector3(point.x-origin_vector.x, point.y-origin_vector.y, point.z-origin_vector.z);
    direction_vector.normalize();
    var ray = new THREE.Raycaster(origin_vector, direction_vector);
    var intersection = ray.intersectObjects(scene.children, true);
    var intersect_index = 0;
    while(intersect_index < intersection.length && intersection[intersect_index].object.name == "Sphere" || String(intersection[intersect_index].object.type) != "Mesh"){
        intersect_index ++;
    }
    if(intersect_index == intersection.length){
        console.log("No intersection found, returning default point");
        return {x: point.x, y: point.y, z: point.z};
    }
    return {x: intersection[intersect_index].point.x, y: intersection[intersect_index].point.y, z: intersection[intersect_index].point.z};
}


/*
 The triangle_area function takes in three parameters: "p1", "p2", and "p3", which are objects with x, y, and z properties representing points in 3D space.
The function uses these points to calculate the area of a triangle formed by these points using the cross product of two vectors and returns the area of the triangle.
 */
function triangle_area(p1, p2, p3){
    //The points should be objects with variables {x, y, z}
    //First, find the vectors from point 1 to the other points
    var vec_1_2 = {x: p2.x-p1.x, y: p2.y-p1.y, z: p2.z-p1.z};
    var vec_1_3 = {x: p3.x-p1.x, y: p3.y-p1.y, z: p3.z-p1.z};
    //|vec_1_2 X vec_1_3| is the area of the parallelogram, double the area
    var area = Math.sqrt(Math.pow(vec_1_2.y*vec_1_3.z-vec_1_3.y*vec_1_2.z, 2)+
            Math.pow(vec_1_2.x*vec_1_3.z-vec_1_3.x*vec_1_2.z, 2)+
            Math.pow(vec_1_2.x*vec_1_3.y-vec_1_3.x*vec_1_2.y, 2));
    return area/2;
}


/*
 The function called "tetrahedron_volume". takes in four parameters: "p1", "p2", "p3", and "p4", which are objects with x, y, and z properties representing points in 3D space.

 The function uses these points to calculate the volume of a tetrahedron formed by these points.
 It does this by using the scalar triple product of vectors formed by the subtraction of coordinates of the four points. The scalar triple product is a scalar value obtained by the dot product of one vector with the cross product of two other vectors.
 */
function tetrahedron_volume(p1, p2, p3, p4){
    return Math.abs((p4.x-p1.x)*((p2.y-p1.y)*(p3.z-p1.z)-(p2.z-p1.z)*(p3.y-p1.y))+(p4.y-p1.y)*((p2.z-p1.z)*(p3.x-p1.x)-(p2.x-p1.x)*(p3.z-p1.z))+(p4.z-p1.z)*((p2.x-p1.x)*(p3.y-p1.y)-(p2.y-p1.y)*(p3.x-p1.x)))/6;
}

/*
 function called "lerp", which stands for "Linear Interpolation". The function takes in three parameters: "x0", "x1", and "alpha".

 The function calculates the interpolated value between two points (x0 and x1) using a value "alpha" that ranges from 0 to 1.

 It does this by multiplying the difference between x1 and x0 by the value of "alpha" and adding the result to the value of x0. This calculates the position between x0 and x1, corresponding to the value of alpha.

 In other words, this function returns the linear interpolation of two values x0 and x1 given a parameter alpha.
 The result is a value that is a weighted average of the two input values, where the weight is determined by the value of alpha.

 The function helps to smoothly transition between two values over time, or to calculate a point on a line between two other points.
 */
function lerp(x0, x1, alpha){
    return ((x1 - x0)*alpha + x0);
}


/*
 The function is used to search for a "Mesh" object in a Three.js scene, and it returns the largest Mesh object in terms of vertex count.
 It's worth to note that this code is written in the context of a 3D scene using Three.js library, and it's using its conventions and specific classes like "Mesh" and "BufferGeometry". Also, it's assuming that the scene, root, and children all have a specific structure, and if any of them is missing or have a different format the code could throw errors.
 */
function getFaceMesh(root, largestSize, largestObject){
    if(root === undefined){
        root = scene;
    }
    for(var a = 0; a < root.children.length; a ++){
        //If the child is a "Mesh" object, it checks if the child has a "geometry" property and if it has a "BufferGeometry" type, then it counts the number of attributes 'position' of the "geometry" object, and compares it with the "largestSize" variable. If the count is greater than "largestSize" or "largestSize" is undefined, the child object is assigned to "largestObject" and its count is assigned to "largestSize".
        if(root.children[a].type ==="Mesh"){
            if(root.children[a].geometry === undefined || root.children[a].geometry.type !== "BufferGeometry"){
                continue;
            }
            var count = root.children[a].geometry.getAttribute('position').count;
            //If the function finds a Mesh object, it will check the number of vertices of this object and compares it with the previous largest object, if it's bigger it will update the largestObject variable.
            if(largestSize == undefined || count > largestSize){
                largestObject = root.children[a];
                largestSize = count;
            }
        }
        //If the child is not a "Mesh" object, the function calls itself recursively, passing the child object as the new "root" parameter, this way the function will continue to search for the largest Mesh object in the children of the current child.
        else{
            var temp = getFaceMesh(root.children[a]);
            if(temp !== undefined){
                var s = temp.geometry.getAttribute('position').count;
                if(s > largestSize || largestSize === undefined){
                    largestObject = temp;
                    largestSize = s;
                }
            }
        }
    }
    return largestObject;
}

/*
 The function is used to determine whether a point is inside a tetrahedron, which is a three-dimensional polyhedron with four triangular faces.
 The function calls the "sameSide" function four times, each time passing in the point, two of the vertices of the tetrahedron that define one face, and the two vertices of the tetrahedron that define the opposite face.
 The function returns a Boolean value, which is the result of checking if all the four calls to the "sameSide" function return true.

 If all the four calls to the "sameSide" function return true, then the point is inside the tetrahedron, meaning that point is on the same side of all the four faces of the tetrahedron as the opposite vertex, otherwise, the point is outside the tetrahedron.
 This function is Used by pointInRegion
 
 Based on the following answer:
 https://stackoverflow.com/questions/25179693/how-to-check-whether-the-point-is-in-the-tetrahedron-or-not
 */
function pointInTetrahedron(point, t1, t2, t3, t4){
    return sameSide(point, t1, t2, t3, t4) &&
        sameSide(point, t2, t3, t4, t1) &&
        sameSide(point, t3, t4, t1, t2) &&
        sameSide(point, t4, t1, t2, t3);
}

/*
 The function calculates a normal vector of the plane that's formed by vertices "t1", "t2" and "t3" using cross product.
 Then it calculates the dot product of the vector "c" and the normal vector and assigns it to a variable called "dotV4"
 Then it calculates the dot product of the vector "d" and the normal vector and assigns it to a variable called "dotP"
 Finally, it returns a Boolean value indicating whether the dot product of "c" and "d" are of the same sign or not.

 The function code is using mathematical concepts such as vector operations, dot product, cross product, and the concept of a normal vector, these concepts are fundamental for 3D computer graphics and computer vision. Also, the code is using the sign function in order to determine if the dot product is positive or negative, this is done in order to know if the point is on the same side of the plane as the vertex.
 */
function sameSide(point, t1, t2, t3, t4){
    var a = {x: (t2.x-t1.x), y: (t2.y-t1.y), z: (t2.z-t1.z)};
    var b = {x: (t3.x-t1.x), y: (t3.y-t1.y), z: (t3.z-t1.z)};
    var c = {x: (t4.x-t1.x), y: (t4.y-t1.y), z: (t4.z-t1.z)};
    var d = {x: (point.x-t1.x), y: (point.y-t1.y), z: (point.z-t1.z)};
    var normal = {x: a.y*b.z-a.z*b.y, y: a.z*b.x-a.x*b.z, z: a.x*b.y-a.y*b.x};
    var dotV4 = normal.x*c.x + normal.y*c.y + normal.z*c.z;
    var dotP  = normal.x*d.x + normal.y*d.y + normal.z*d.z;
    return (Math.sign(dotV4) == Math.sign(dotP));
}

/*
 The pointInRegion function checks if a point is within the region outlined by a set of points.

 The function starts by checking if the "region_center" parameter is undefined, if it is, the function calculates the center of the region by averaging the x, y, and z coordinates of all the points in the "region_points" array.
 Then it iterates over the "region_points" array up to the second to last element, for each pair of consecutive points, it calls the "pointInTetrahedron" function passing in the "point" parameter and the current pair of points, along with the "region_center" parameter.
 The "pointInTetrahedron" function is used here to check if the point is inside a tetrahedron formed by the current pair of points and the center of the region. If the "pointInTetrahedron" function returns true, the "pointInRegion" function returns true, indicating that the point is inside the region.
 Finally, the function calls the "pointInTetrahedron" function one last time, passing in the first and last points of the "region_points" array, along with the "region_center" parameter to check for any point that might have been missed on the previous iterations. If this final call to "pointInTetrahedron" returns true, the "pointInRegion" function also returns true. If none of the calls to "pointInTetrahedron" return true, the function returns false, indicating that the point is outside of the region.

 It is worth noting that this code is assuming that the region is a closed shape, and that the points in the "region_points" array are in a specific order (clockwise or counterclockwise) and that the "pointInTetrahedron" function is implemented correctly. Also, it's worth noting that this code is using the concept of 2D regions in 3D space, and the use of the "pointInTetrahedron" function. This is a common practice in computer graphics and computer vision, where 3D models are used to represent 2D regions.

 //E.g. is this point between the sn, al_l, n, and al_r?
 //You can optionally pass in a pre-defined center to these points to reduce computation
 //Used by the new findAreaOrVolume function

 */
function pointInRegion(point, region_points, region_center){
    if(region_center === undefined){
        region_center = {x: 0, y: 0, z: 0};
        for(var a = 0; a < region_points.length; a ++){
            region_center.x += region_points[a].x/region_points.length;
            region_center.y += region_points[a].y/region_points.length;
            region_center.z += region_points[a].z/region_points.length;
        }
    }

    for(var a = 0; a < region_points.length-1; a ++){
        if(pointInTetrahedron(point,
            {x: 0, y: 0, z: 0},
            {x: region_points[a].x*2, y: region_points[a].y*2, z: region_points[a].z*2},
            {x: region_points[a+1].x*2, y: region_points[a+1].y*2, z: region_points[a+1].z*2},
            region_center)){
                return true;
        }
    }
    return pointInTetrahedron(point,
        {x: 0, y: 0, z: 0},
        {x: region_points[0].x*2, y: region_points[0].y*2, z: region_points[0].z*2},
        {x: region_points[region_points.length-1].x*2, y: region_points[region_points.length-1].y*2, z: region_points[region_points.length-1].z*2},
        region_center);
}

