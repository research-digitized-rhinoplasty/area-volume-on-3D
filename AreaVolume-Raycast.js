/*
The function takes in three parameters: "mId", "isVolume", and "resolution".
"mId" parameter is the measurement id, and it is used to reference the "usedFeatures" property of the object.
"isVolume" parameter is a Boolean value that determines if the function should calculate the area or volume of the region.
"resolution" parameter is used to determine the precision of the calculation. The code have 3 options for resolution: 1mm, 2mm, and 4mm, with smaller resolution resulting in higher accuracy.

The function begins by making sure all points are defined before beginning the calculation. It then checks if the resolution is passed and get it from the UI element "precisionSelect" combobox.
The function then creates a clone of each of the required points and splits it into a bunch of quads, calculating each quad independently. The function then uses these points to calculate the area or volume of the region.
*/
function findAreaOrVolume(mId, isVolume, resolution){
    //Make sure all points are defined before beginning calculation
    for(var a = 0; a < mId.usedFeatures.length; a ++){
        if(measurementPoints[a] == "" || measurementPoints[a].xVal == ""){
            return;
        }
    }
    //if resolution is not passed, get it from the UI element "precisionSelect" combobox
    if(resolution === undefined){
        var select = document.getElementById("precisionSelect");
        resolution = parseInt(select.options[select.selectedIndex].value);
    }
    var current_date = new Date(); //For performance analysis
    var current_millis = current_date.getTime();
    var total_points = 0;
    //We need 2 arrays to calculate the area one strip at a time
    var old_array = [];
    var new_array = [];
    //The base arrays hold points corresponding to the flat surface before using the raycaster, for volume measurement
    var old_base_array = [];
    var new_base_array = [];
    var total_area = 0;
    var base_area = 0;
    var total_volume = 0;
    var min_z = 999;
    //Arrays to store the border points for displaying the lines later
    var left_array  = [];
    var right_array = [];
    var top_array   = [];
    var bottom_array= [];

    //Make a clone of each of the required points
    var clonedPoints = [];
    for(var a = 0; a < mId.usedFeatures.length; a ++){
        clonedPoints[a] = {x: measurementPoints[a].xVal, y: measurementPoints[a].yVal, z: measurementPoints[a].zVal};
    }
    //Split it into a bunch of quads, calculate each quad independently
    for(var a = 0; a < mId.usedFeatures.length-2; a += 2){
        //First, define the four corner points
        //a is the bottom-left or bottom_right point (it alternates)
        //Vertical_Fifths_Horizontal_Thirds_* is a special kind of measurement that has a rectangular shape with 4 corner landmarks defining the boundaries
        if(mId.id === "Vertical_Fifths_Horizontal_Thirds_Area" || mId.id === "Vertical_Fifths_Horizontal_Thirds_Volume"){
            //0 and 2 are left and right, 1 and 3 are top and bottom
            var p0 = {x: clonedPoints[0].x,  y:clonedPoints[1].y,  z:clonedPoints[0].z};
            var p1 = {x: clonedPoints[2].x,  y:clonedPoints[1].y,  z:clonedPoints[2].z};
            var p2 = {x: clonedPoints[2].x,  y:clonedPoints[3].y,  z:clonedPoints[2].z};
            var p3 = {x: clonedPoints[0].x,  y:clonedPoints[3].y,  z:clonedPoints[0].z};
            p0 = get_projection_point(p0, {x:p0.x, y:p0.y, z:p0.z*2});
            p1 = get_projection_point(p1, {x:p1.x, y:p1.y, z:p1.z*2});
            p2 = get_projection_point(p2, {x:p2.x, y:p2.y, z:p2.z*2});
            p3 = get_projection_point(p3, {x:p3.x, y:p3.y, z:p3.z*2});
        }
        else{
            var p0 = {x: clonedPoints[a].x,   y:clonedPoints[a].y,   z:clonedPoints[a].z};
            var p1 = {x: clonedPoints[a+1].x, y:clonedPoints[a+1].y, z:clonedPoints[a+1].z};
            var p2 = {x: clonedPoints[a+2].x, y:clonedPoints[a+2].y, z:clonedPoints[a+2].z};
            var p3 = p2;
            if(a+3 < mId.usedFeatures.length){
                //For odd-numbered polygons, the last point will be repeated twice to make a triangle
                p3 = {x: clonedPoints[a+3].x,  y:clonedPoints[a+3].y,  z:clonedPoints[a+3].z};
            }
            if(a%4 === 2){
                //Every even-numbered quadrilateral needs to be flipped horizontally
                var t = p0;
                p0 = p1;
                p1 = t;
                t = p3;
                p3 = p2;
                p2 = t;
            }
        }
        
        var distance_0_1 = Math.sqrt(Math.pow(p0.x-p1.x, 2)+Math.pow(p0.y-p1.y, 2)+Math.pow(p0.z-p1.z, 2));
        var distance_3_2 = Math.sqrt(Math.pow(p3.x-p2.x, 2)+Math.pow(p3.y-p2.y, 2)+Math.pow(p3.z-p2.z, 2));
        var distance_0_3 = Math.sqrt(Math.pow(p0.x-p3.x, 2)+Math.pow(p0.y-p3.y, 2)+Math.pow(p0.z-p3.z, 2));
        var distance_2_1 = Math.sqrt(Math.pow(p2.x-p1.x, 2)+Math.pow(p2.y-p1.y, 2)+Math.pow(p2.z-p1.z, 2));
        var x_split = Math.ceil(Math.max(distance_0_1, distance_3_2)/resolution); //How many squares will there be?
        var y_split = Math.ceil(Math.max(distance_0_3, distance_2_1)/resolution); //There will be split+1 points across the axis
        //Note that those aren't the actual x and y axes, in this context I call "x" 0->1 and 3->2 and "y" 0->3 and 1->2
        
        //Iterate over x_split points left/right and y_split points up/down
        //Find the area or volume of each quad, sum them all up
        for(var c_y = 0; c_y <= y_split; c_y ++){
            new_array.length = 0; //Empty the current array
            new_base_array.length = 0;
            //Left point; between p0 and p3
            var lp = {x: lerp(p0.x, p3.x, c_y/y_split), y: lerp(p0.y, p3.y, c_y/y_split), z: lerp(p0.z, p3.z, c_y/y_split)};
            //Right point; between p1 and p2
            var rp = {x: lerp(p1.x, p2.x, c_y/y_split), y:lerp(p1.y, p2.y, c_y/y_split), z:lerp(p1.z, p2.z, c_y/y_split)};
            for(var c_x = 0; c_x <= x_split; c_x ++){
                //Between the left and right points
                var base_point = {x: lerp(lp.x, rp.x, c_x/x_split), y: lerp(lp.y, rp.y, c_x/x_split), z: lerp(lp.z, rp.z, c_x/x_split)};
                var real_point;
                if(mId.id === "Alar_Base_Area" || mId.id === "Alar_Base_Volume"){
                    real_point = get_projection_point(base_point, {x:0, y:-50, z:200});
                }
                else if(mId.id === "Vertical_Fifths_Horizontal_Thirds_Area" || mId.id === "Vertical_Fifths_Horizontal_Thirds_Volume"){
                    real_point = get_projection_point(base_point, {x:base_point.x, y:base_point.y, z:base_point.z*2});
                }
                else{
                    real_point = get_projection_point(base_point);
                }
                new_array.push(real_point);
                base_point = {x:base_point.x, y:base_point.y, z:0};
                new_base_array.push(base_point);
                //Don't add the areas of the leftmost and bottommost points, the arrays will be out of range
                if(c_y > 0 && c_x > 0){
                    var l = new_array.length;
                    total_volume += tetrahedron_volume(new_array[l-2], new_array[l-1], old_array[l-1], new_base_array[l-1]);
                    total_volume += tetrahedron_volume(new_array[l-2], old_array[l-2], old_array[l-1], old_base_array[l-2]);
                    total_volume += tetrahedron_volume(new_base_array[l-1], old_base_array[l-1], old_base_array[l-2], old_array[l-1]);
                    total_volume += tetrahedron_volume(new_base_array[l-1], new_base_array[l-2], old_base_array[l-2], new_array[l-2]);
                    total_volume += tetrahedron_volume(new_base_array[l-1], new_array[l-2], old_base_array[l-2], old_array[l-1]);
                    total_area += triangle_area(new_array[l-1], new_array[l-2], old_array[l-2]);
                    total_area += triangle_area(new_array[l-1], old_array[l-2], old_array[l-1]);
                    base_area  += triangle_area(new_base_array[l-1], new_base_array[l-2], old_base_array[l-2]);
                    base_area  += triangle_area(new_base_array[l-1], old_base_array[l-2], old_base_array[l-1]);
                }
                if(real_point.z < min_z){
                    min_z = real_point.z;
                }
                //Add the border points to arrays to draw (in Vector3 form)
                if(c_x === 0){
                    left_array.push(new THREE.Vector3(real_point.x, real_point.y, real_point.z));
                }
                if(c_y === 0 && a === 0){
                    bottom_array.push(new THREE.Vector3(real_point.x, real_point.y, real_point.z));
                }
                if(c_x === x_split){
                    right_array.push(new THREE.Vector3(real_point.x, real_point.y, real_point.z));
                }
                if(c_y === y_split && a+4 >= mId.usedFeatures.length){
                    left_array.push(new THREE.Vector3(real_point.x, real_point.y, real_point.z));
                }
                total_points ++;
            }
            //This is swapping the pointers, not the values
            var t = old_array;
            old_array = new_array;
            new_array = t;
            t = old_base_array;
            old_base_array = new_base_array;
            new_base_array = t;
        }
    }
    //console.log("Volume before subtraction: "+total_volume);
    //Total volume is volume from surface to z=0
    total_volume -= min_z*base_area; //so we subtract the area from z=0 to where the new base is
    
    current_date = new Date();
    var time_elapsed = current_date.getTime() - current_millis;
    console.log("Elapsed milliseconds: " + time_elapsed);
    console.log("Total points calculated: " + total_points);
    //console.log("Min Z: "+min_z);
    //console.log("Base Area: "+base_area);
    return {a_val: total_area.toFixed(2), v_val: total_volume.toFixed(2), points: total_points, time: time_elapsed}; //For generating CSV for measurement data
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
    
    //Checks if an "origin" parameter is passed, and if not, it creates a new THREE.Vector3 object with the point's x, y, and z properties and normalizes it. It then multiplies this vector by 3000.
    if(origin === undefined){
        //By default, it's super far out and facing the origin
        origin_vector = new THREE.Vector3(point.x, point.y, point.z);
        origin_vector.normalize();
        origin_vector.multiplyScalar(3000);
    }
    else{
        origin_vector = new THREE.Vector3(origin.x, origin.y, origin.z);
    }
    
    //Create a new THREE.Vector3 object called "direction_vector" which takes the difference between the "origin_vector" and the point. It then normalizes this vector.
    var direction_vector = new THREE.Vector3(point.x-origin_vector.x, point.y-origin_vector.y, point.z-origin_vector.z);
    direction_vector.normalize();
    
    //Creates a new THREE.Raycaster object, which takes in "origin_vector" and "direction_vector" as parameters, representing the origin and direction of the raycast.
    var ray = new THREE.Raycaster(origin_vector, direction_vector);
    
    //Use the "intersectObjects" method of the raycaster object to check if the ray intersects with any objects in the scene (specified by the "scene.children" parameter) and assigns the result to the "intersection" variable.

    var intersection = ray.intersectObjects(scene.children, true);
    var intersect_index = 0;
    
    //Loop through the "intersection" array and checks if the object's name is "Sphere" or its type is not "Mesh" and increments the "intersect_index" variable.
    while(intersect_index < intersection.length && intersection[intersect_index].object.name == "Sphere" || String(intersection[intersect_index].object.type) != "Mesh"){
        intersect_index ++;
    }
    
    //If the "intersect_index" is equal to the length of the "intersection" array, the function logs that no intersection was found and returns the default point.
    if(intersect_index == intersection.length){
        console.log("No intersection found, returning default point");
        return {x: point.x, y: point.y, z: point.z};
    }
    //Otherwise, it returns an object with the x, y, and z properties of the intersection point.

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
    
    //Calculate the area of the parallelogram formed by the cross product of these two vectors.
    //Take the square root of the sum of the squares of the differences between the x, y, and z properties of the two vectors.
    var area = Math.sqrt(Math.pow(vec_1_2.y*vec_1_3.z-vec_1_3.y*vec_1_2.z, 2)+
            Math.pow(vec_1_2.x*vec_1_3.z-vec_1_3.x*vec_1_2.z, 2)+
            Math.pow(vec_1_2.x*vec_1_3.y-vec_1_3.x*vec_1_2.y, 2));
    
    //Return the area divided by 2, which is the area of the triangle.
    return area/2;
}


/*
 The function called "tetrahedron_volume". takes in four parameters: "p1", "p2", "p3", and "p4", which are objects with x, y, and z properties representing points in 3D space.

 The function uses these points to calculate the volume of a tetrahedron formed by these points.
 It does this by using the scalar triple product of vectors formed by the subtraction of coordinates of the four points. The scalar triple product is a scalar value obtained by the dot product of one vector with the cross product of two other vectors.
 */
function tetrahedron_volume(p1, p2, p3, p4){
    
    //Calculate the volume of a tetrahedron, the function is returning the volume of the tetrahedron using the scalar triple product of vectors.
    //Return the volume of a tetrahedron formed by 4 points, using the scalar triple product of vectors formed by the subtraction of coordinates of the four points.
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
