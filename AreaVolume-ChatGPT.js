
/*
 Write the javascript function that does the following: Gets an obj file name as input and an array of vertices that defines boundaries. The function reads the .obj file and then computes the surface area that is bounded by an n number of vertices. The n number of boundary vertices is given as the array input. The function returns two values 1) total area when all vertices of a face are within the boundaries 2) total area when even one vertex of a face is within the boundaries. Do not write explanations.
 */

/*
 The function 'calculateTotalSurfaceArea' takes in two arguments: the name of the obj file and an array of vertices that define the boundaries.

 It starts by reading the obj file and processing the vertex and face data. It then initializes two variables, totalSurfaceAreaAll and totalSurfaceAreaOne, to keep track of the total surface area when all vertices of a face are within the boundaries, and total surface area when even one vertex of a face is within the boundaries.

 The function then loops through all the faces in the obj file, and for each face, it loops through all the vertices of the face. For each vertex, it loops through all the boundary vertices, and checks if the current vertex is equal to any of the boundary vertices. If a match is found, it increments the variable verticesInBoundary.

 After checking all the vertices of a face, it checks if all the vertices are within the boundaries by checking if verticesInBoundary equals the number of vertices in the face. If it is true, the function computes the surface area of the face using the Heron's formula, and adds it to the totalSurfaceAreaAll.

 If not all vertices are within the boundaries, the function checks if at least one vertex is within the boundaries by checking if verticesInBoundary is greater than 0. If this is true, the function again computes the surface area of the face using the Heron's formula, and adds it to the totalSurfaceAreaOne.

 Finally, the function returns an array with two values, totalSurfaceAreaAll and totalSurfaceAreaOne, which represent the total surface area when all vertices of a face are within the boundaries, and total surface area when even one vertex of a face is within the boundaries respectively.
 
 This code will enable the user to understand how much area of the 3D model is within the boundaries defined by the user and how much area is not within the boundaries. This can be useful in various applications, such as in computer vision and computer graphics, where the user needs to compute the surface area of a specific region in a 3D model.
 */

function calculateTotalSurfaceArea(modelName, boundaryVertices) {
  let objText = readFileText(modelName);
  let vertexData = [];
  let faceData = [];
  let lines = objText.split("\n");
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    let parts = line.split(" ");
    if (parts[0] === "v") {
        vertexData.push([parseFloat(parts[1]),parseFloat(parts[2]),parseFloat(parts[3])]);
    } else if (parts[0] === "f") {
        let vertexIndices = parts.slice(1).map(x => parseInt(x) - 1);
        faceData.push({vertexIndices});
    }
  }
  alert(boundaryVertices);
  let totalSurfaceAreaAll = 0;
  let totalSurfaceAreaOne = 0;
  for (let i = 0; i < faceData.length; i++) {
    let vertexIndices = faceData[i].vertexIndices;
    let verticesInBoundary = 0;
    for (let j = 0; j < vertexIndices.length; j++) {
      for (let k = 0; k < boundaryVertices.length; k++) {
        if (vertexData[vertexIndices[j]][0] === boundaryVertices[k][0] && vertexData[vertexIndices[j]][1] === boundaryVertices[k][1] && vertexData[vertexIndices[j]][2] === boundaryVertices[k][2]) {
          verticesInBoundary++;
          break;
        }
      }
    }
    //alert(verticesInBoundary);
    //alert(vertexIndices.length);
    if (verticesInBoundary === vertexIndices.length) {
      let vertex1 = vertexData[vertexIndices[0]];
      let vertex2 = vertexData[vertexIndices[1]];
      let vertex3 = vertexData[vertexIndices[2]];
      let a = Math.sqrt(Math.pow(vertex2[0] - vertex1[0], 2) + Math.pow(vertex2 - vertex1[1], 2) + Math.pow(vertex2[2] - vertex1[2], 2));
        let b = Math.sqrt(Math.pow(vertex3[0] - vertex2[0], 2) + Math.pow(vertex3[1] - vertex2[1], 2) + Math.pow(vertex3[2] - vertex2[2], 2));
        let c = Math.sqrt(Math.pow(vertex1[0] - vertex3[0], 2) + Math.pow(vertex1[1] - vertex3[1], 2) + Math.pow(vertex1[2] - vertex3[2], 2));
        let s = (a + b + c) / 2;
        let surfaceArea = Math.sqrt(s * (s - a) * (s - b) * (s - c));
        totalSurfaceAreaAll += surfaceArea;
      } else if (verticesInBoundary > 0) {
        let vertex1 = vertexData[vertexIndices[0]];
        let vertex2 = vertexData[vertexIndices[1]];
        let vertex3 = vertexData[vertexIndices[2]];
        let a = Math.sqrt(Math.pow(vertex2[0] - vertex1[0], 2) + Math.pow(vertex2[1] - vertex1[1], 2) + Math.pow(vertex2[2] - vertex1[2], 2));
        let b = Math.sqrt(Math.pow(vertex3[0] - vertex2[0], 2) + Math.pow(vertex3[1] - vertex2[1], 2) + Math.pow(vertex3[2] - vertex2[2], 2));
        let c = Math.sqrt(Math.pow(vertex1[0] - vertex3[0], 2) + Math.pow(vertex1[1] - vertex3[1], 2) + Math.pow(vertex1[2] - vertex3[2], 2));
        let s = (a + b + c) / 2;
        let surfaceArea = Math.sqrt(s * (s - a) * (s - b) * (s - c));
        totalSurfaceAreaOne += surfaceArea;
      }
    }
    return [totalSurfaceAreaAll, totalSurfaceAreaOne];
  }

/*
 The function receives two parameters: modelName is the name of the obj file that we want to read and vertexData is an array of vertices that defines the boundaries. The function is reading the obj file and getting the vertex and face data from the file. It initializes two variables totalSurfaceAreaAllVertices and totalSurfaceAreaOneOrMoreVertices to store the surface area of the model in the boundary and outside the boundary respectively.
 Then it loops through the faces, for each face it gets the three vertices of the face, checks if at least one vertex of the face is within the boundary, if so, it calculates the area of the face, then it checks if all the vertices of the face are within the boundary, if so, it adds the area of the face to the totalSurfaceAreaAllVertices. It also adds the area of the face to totalSurfaceAreaOneOrMoreVertices in both cases. Finally, it returns an array with the two values of total surface area, one for all vertices within the boundary and the other for one or more vertices within the boundary.
 */


function calculateTotalSurfaceAreaHasError(modelName, vertexData) {
    let totalSurfaceAreaAllVertices = 0;
    let totalSurfaceAreaOneOrMoreVertices = 0;
    
    let objText = readFileText(modelName);
    let vertices = [];
    let faces = [];
    let lines = objText.split("\n");
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      let parts = line.split(" ");
      if (parts[0] === "v") {
          vertices.push([parseFloat(parts[1]),parseFloat(parts[2]),parseFloat(parts[3])]);
      } else if (parts[0] === "f") {
          let vertexIndices = parts.slice(1).map(x => parseInt(x) - 1);
          faces.push({vertexIndices});
      }
    }

    let minZ = Number.MAX_VALUE;
    for (let i = 0; i < vertexData.length; i++) {
      minZ = Math.min(minZ, vertexData[i][2]);
    }
    for (let i = 0; i < faces.length; i++) {
        let face = faces[i];
        let vertex1 = vertices[face[0] - 1];
        let vertex2 = vertices[face[1] - 1];
        let vertex3 = vertices[face[2] - 1];
        let isInside = true;
        let area = 0;
        if ((vertex1 !== undefined) && (vertex2 !== undefined) && (vertex3 !== undefined))
        {
            if (vertex1[2] <= minZ || vertex2[2] <= minZ || vertex3[2] <= minZ) {
                area = triangleArea([vertex1[0], vertex1[1], vertex1[2]], [vertex2[0], vertex2[1], vertex2[2]], [vertex3[0], vertex3[1], vertex3[2]]);
                totalSurfaceAreaOneOrMoreVertices += area;
                if (vertexData.length > 0) {
                    for (let j = 0; j < vertexData.length; j++) {
                        let point = vertexData[j];
                        if (point[0] === vertex1[0] && point[1] === vertex1[1] && point[2] === vertex1[2]) {
                            isInside = true;
                            break;
                        } else if (point[0] === vertex2[0] && point[1] === vertex2[1] && point[2] === vertex2[2]) {
                            isInside = true;
                            break;
                        } else if (point[0] === vertex3[0] && point[1] === vertex3[1] && point[2] === vertex3[2]) {
                            isInside = true;
                            break;
                        } else {
                            isInside = false;
                        }
                    }
                }
                if (isInside) {
                    totalSurfaceAreaAllVertices += area;
                }
            }
        }
    }
    return [totalSurfaceAreaAllVertices, totalSurfaceAreaOneOrMoreVertices];
}

/*
 This function calculates the area of a triangle given the coordinates of its three vertices. It uses the distance formula to calculate the length of each side of the triangle. Then it uses Heron's formula to calculate the area of the triangle. The distance formula is used to calculate the length of each side of the triangle by subtracting the x, y and z coordinates of two vertices and then using the pow and sqrt functions to find the square root of the sum of the squares of these differences.
 */
function triangleArea(vertex1, vertex2, vertex3) {
  let side1 = Math.sqrt(Math.pow(vertex2[0] - vertex1[0], 2) + Math.pow(vertex2[1] - vertex1[1], 2) + Math.pow(vertex2[2] - vertex1[2], 2));
  let side2 = Math.sqrt(Math.pow(vertex3[0] - vertex2[0], 2) + Math.pow(vertex3[1] - vertex2[1], 2) + Math.pow(vertex3[2] - vertex2[2], 2));
  let side3 = Math.sqrt(Math.pow(vertex1[0] - vertex3[0], 2) + Math.pow(vertex1[1] - vertex3[1], 2) + Math.pow(vertex1[2] - vertex3[2], 2));
  let s = (side1 + side2 + side3) / 2;
  return Math.sqrt(s * (s - side1) * (s - side2) * (s - side3));
}



/*
 The calculateTotalVolume function is a JavaScript function that takes in two parameters: the file name of an OBJ file and an array of vertices that define the boundaries. The function uses the readOBJFile function to read the contents of the OBJ file and parse it into usable data. Then it uses the parsed data to calculate the volume of the space that is bounded by the n number of vertices.

 The function starts by initializing a variable volume to 0. Then it uses a for loop to iterate through all the faces of the model. For each face, it gets the vertex coordinates of the three points that make up the face. Then it uses the isInside function to check if all vertices of the face are inside the boundaries defined by the array of vertices passed to the function. It uses another loop to check if one of the vertices is inside the boundaries defined by the array of vertices passed to the function. If all the vertices of the face are inside the boundaries, it calls the signedVolumeOfTriangle function, which takes in the vertex coordinates of the three points that make up the face and returns the signed volume of the tetrahedron formed by these 3 points. The function then adds this signed volume to the volume variable.

 After iterating through all the faces, the function returns the total volume of the space that is bounded by the n number of vertices.
 */

function calculateTotalVolumeSingleResult(modelName, vertexData) {
    let objFile = readOBJFile(modelName);
    let volume = 0;
    let vertex1, vertex2, vertex3;
    for (let i = 0; i < objFile.faces.length; i++) {
        vertex1 = objFile.vertices[objFile.faces[i][0]];
        vertex2 = objFile.vertices[objFile.faces[i][1]];
        vertex3 = objFile.vertices[objFile.faces[i][2]];
        let isInBoundary = true;
        for (let j = 0; j < vertexData.length; j++) {
            if (!isInside([vertex1[0], vertex1[1]], vertexData) && !isInside([vertex2[0], vertex2[1]], vertexData) && !isInside([vertex3[0], vertex3[1]], vertexData)) {
                isInBoundary = false;
                break;
            }
        }
        if (isInBoundary) {
            volume += signedVolumeOfTriangle(vertex1, vertex2, vertex3);
        }
    }
    return volume;
}

/*
 The calculateTotalVolume function is a JavaScript function that takes in two parameters: the file name of an OBJ file and an array of vertices that define the boundaries. The function uses the readOBJFile function to read the contents of the OBJ file and parse it into usable data. Then it uses the parsed data to calculate the volume of the space that is bounded by the n number of vertices.

 The function starts by initializing two variables volume_all_within and volume_one_within to 0. Then it uses a for loop to iterate through all the faces of the model. For each face, it gets the vertex coordinates of the three points that make up the face. Then it uses the isInside function to check if all vertices of the face are inside the boundaries defined by the array of vertices passed to the function. Also, it uses another loop to check if one of the vertices is inside the boundaries defined by the array of vertices passed to the function.

 If all the vertices of the face are inside the boundaries, it calls the signedVolumeOfTriangle function, which takes in the vertex coordinates of the three points that make up the face and returns the signed volume of the tetrahedron formed by these 3 points. The function then adds this signed volume to the volume_all_within variable. If at least one vertex of the face is inside the boundaries, it adds the signed volume of the tetrahedron formed by these 3 points, to the volume_one_within variable.

 After iterating through all the faces, the function returns an object that contains two properties: volume_all_within and volume_one_within that represent the total volume when all vertices of a face are within the boundaries and the total volume when at least one vertex of a face is within the boundaries respectively.
 */
function calculateTotalVolumeNoMinZ(fileName, boundaries) {
    var modelData = readOBJFile(fileName);
    var vertices = modelData.vertices;
    var faces = modelData.faces;
    var volume_all_within = 0;
    var volume_one_within = 0;
    for (var i = 0; i < faces.length; i++) {
        var face = faces[i];
        var p1 = vertices[face[0]];
        var p2 = vertices[face[1]];
        var p3 = vertices[face[2]];
        var is_all_within = true;
        var is_one_within = false;
        for(var j = 0; j < 3; j++) {
            var vertex = [p1[j], p2[j], p3[j]];
            if (!isInside(vertex, boundaries)) {
                is_all_within = false;
            } else {
                is_one_within = true;
            }
        }
        if (is_all_within) {
            volume_all_within += signedVolumeOfTriangle(p1, p2, p3);
        }
        if (is_one_within) {
            volume_one_within += signedVolumeOfTriangle(p1, p2, p3);
        }
    }
    return {volume_all_within: volume_all_within, volume_one_within: volume_one_within};
}

function calculateTotalVolume(objFileName, vertices) {
    let vertexData = readOBJFile(objFileName);
    let faces = vertexData.faces;
    let verticesIndex = vertexData.vertices;
    let totalVolume = 0;
    let totalVolumeInBoundary = 0;
    let minZ = Number.MAX_SAFE_INTEGER;
    for (let i = 0; i < vertices.length; i++) {
        minZ = Math.min(minZ, vertices[i][2]);
    }
    for (let i = 0; i < faces.length; i++) {
        let face = faces[i];
        let v1 = verticesIndex[face[0] - 1];
        let v2 = verticesIndex[face[1] - 1];
        let v3 = verticesIndex[face[2] - 1];
        let volume = 0;
        if ((v1 !== undefined) && (v2 !== undefined) && (v3 !== undefined))
            volume = tetrahedronVolume(v1, v2, v3, minZ);
        totalVolume += volume;
        let inBoundary = true;
        for (let j = 0; j < 3; j++) {
            if (verticesIndex[face[j] - 1] !== undefined)
            {
                if (!isInside(verticesIndex[face[j] - 1], vertices)) {
                    inBoundary = false;
                    break;
                }
            }
        }
        if (inBoundary) {
            totalVolumeInBoundary += volume;
        }
    }
    return [totalVolume, totalVolumeInBoundary];
}



/*
 isInside function takes in a point represented by [x,y,z] and an array of vertices vs representing the boundaries, and it checks if the point is inside the polygon defined by the vertices. The function uses a ray-casting algorithm based on a method provided by Rensselaer Polytechnic Institute.
 */
function isInsideOLD(point, vs) {
    // ray-casting algorithm based on
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
    
    var x = point[0], y = point[1], z = point[2];
    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        var xi = vs[i][0], yi = vs[i][1], zi = vs[i][2];
        var xj = vs[j][0], yj = vs[j][1], zj = vs[j][2];
        var intersect = ((yi > y) != (yj > y)) && (zi > z) != (zj > z) && (xi > x) != (xj > x)
        if (intersect) inside = !inside;
    }
    return inside;
}

function isInside(point, vertices) {
    let isInside = false;
    for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
        let xi = vertices[i][0], yi = vertices[i][1];
        let xj = vertices[j][0], yj = vertices[j][1];
        let intersect = ((yi > point[1]) != (yj > point[1])) && (point[0] < (xj - xi) * (point[1] - yi) / (yj - yi) + xi);
        if (intersect) isInside = !isInside;
    }
    return isInside;
}


/*
 The signedVolumeOfTriangle function takes in 3 points represented by [x,y,z] and uses them to calculate the signed volume of the tetrahedron formed by these 3 points. It uses the scalar triple product of vectors method to calculate the volume.
 */
function signedVolumeOfTriangle(p1, p2, p3) {
    var v321 = p3[0]*p2[1]*p1[2];
    var v231 = p2[0]*p3[1]*p1[2];
    var v312 = p3[0]*p1[1]*p2[2];
    var v132 = p1[0]*p3[1]*p2[2];
    var v213 = p2[0]*p1[1]*p3[2];
    var v123 = p1[0]*p2[1]*p3[2];
    return (1.0/6.0)*(-v321 + v231 + v312 - v132 - v213 + v123);
}


function readFileText(fileName) {
    // read the contents of the OBJ file
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("text/plain");
    rawFile.open("GET", fileName, false);
    rawFile.send();
    var allText = rawFile.responseText;
    return allText;
}

/*
 This function takes in the file name of an OBJ file and uses the XMLHttpRequest object to read the contents of the file. The file is read as a string and is then split into an array of lines. The function then loops through the lines of the file, and for each line it checks the first character to determine if it is a vertex ("v") or a face ("f"). The vertex lines are parsed into an array of x, y, and z values, and the face lines are parsed into an array of vertex indices. The function then returns an object containing the vertices and faces arrays, which can be used in the calculateTotalVolume function.
 */
function readOBJFile(fileName) {
    // read the contents of the OBJ file
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("text/plain");
    rawFile.open("GET", fileName, false);
    rawFile.send();
    var allText = rawFile.responseText;
    // parse the OBJ file contents into usable data
    var lines = allText.split("\n");
    var vertices = [];
    var faces = [];
    for (var i = 0; i < lines.length; i++) {
        var parts = lines[i].split(" ");
        if (parts[0] == "v") {
            vertices.push([parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])]);
        } else if (parts[0] == "f") {
            var face = [];
            for (var j = 1; j <= 3; j++) {
                var vertexIndex = parts[j].split("/")[0];
                face.push(vertexIndex - 1);
            }
            faces.push(face);
        }
    }
    return {vertices: vertices, faces: faces};
}

function readOBJFileOLD(fileName) {
    // read the contents of the OBJ file
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("text/plain");
    rawFile.open("GET", fileName, false);
    rawFile.onreadystatechange = function () {
        if(rawFile.readyState === 4) {
            if(rawFile.status === 200 || rawFile.status == 0) {
                var allText = rawFile.responseText;
                // parse the OBJ file contents into usable data
                var lines = allText.split("\n");
                var vertices = [];
                var faces = [];
                for (var i = 0; i < lines.length; i++) {
                    var parts = lines[i].split(" ");
                    if (parts[0] == "v") {
                        vertices.push([parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3])]);
                    } else if (parts[0] == "f") {
                        var face = [];
                        for (var j = 1; j <= 3; j++) {
                            var vertexIndex = parts[j].split("/")[0];
                            face.push(vertexIndex - 1);
                        }
                        faces.push(face);
                    }
                }
                return {vertices: vertices, faces: faces};
            }
        }
    }
    rawFile.send(null);
}


/*
 ANOTHER WAY
 
 the calculateTotalVolume function starts by initializing two variables volume_all_within and volume_one_within to 0. Then it uses a for loop to iterate through all the faces of the model. For each face, it gets the vertex coordinates of the three points that make up the face. Then it uses the isInside function to check if all vertices of the face are inside the boundaries defined by the array of vertices passed to the function, if so it sets the variable is_all_within to true. Also, it uses another loop to check if one of the vertices is inside the boundaries defined by the array of vertices passed to the function, if so it sets the variable is_one_within to true.

 If all the vertices of the face are inside the boundaries, it calls the tetrahedronVolume function, which takes in the vertex coordinates of the three points that make up the face and returns the volume of the tetrahedron formed by these 3 points. The function then adds this volume to the volume_all_within variable. If at least one vertex of the face is inside the boundaries, it adds the volume of the tetrahedron formed by these 3 points, to the volume_one_within variable.

 After iterating through all the faces, the function returns an object that contains two properties: volume_all_within and volume_one_within that represent the total volume when all vertices of a face are within the boundaries and the total volume when at least one vertex of a face is within the boundaries respectively.
 */

function calculateTotalVolumeAnotherWay(fileName, boundaries) {
    var modelData = readOBJFile(fileName);
    var vertices = modelData.vertices;
    var faces = modelData.faces;
    var volume_all_within = 0;
    var volume_one_within = 0;
    for (var i = 0; i < faces.length; i++) {
        var face = faces[i];
        var p1 = vertices[face[0]];
        var p2 = vertices[face[1]];
        var p3 = vertices[face[2]];
        var is_all_within = true;
        var is_one_within = false;
        for(var j = 0; j < 3; j++) {
            var vertex = [p1[j], p2[j], p3[j]];
            if (!isInside(vertex, boundaries)) {
                is_all_within = false;
            } else {
                is_one_within = true;
            }
        }
        if (is_all_within) {
            volume_all_within += tetrahedronVolume(p1, p2, p3);
        }
        if (is_one_within) {
            volume_one_within += tetrahedronVolume(p1, p2, p3);
        }
    }
    return {'volume_all_within': volume_all_within, 'volume_one_within': volume_one_within};
}



/*
 The tetrahedronVolume function is used by the above calculateTotalVolumeAnotherWay function.
 
 The tetrahedronVolume function takes in three points (p1, p2, and p3) as arguments, which are the coordinates of the vertices of the tetrahedron in the form of [x, y, z]. It then calculates the distance between each pair of points using the distance formula and assigns them to variables a, b and c. Using these distance values, it calculates the semi-perimeter of the triangle using the semi-perimeter formula s = (a + b + c) / 2. Next, it calculates the area of the triangle using Heron's formula and assigns it to the variable area. Then it calculates the height of the tetrahedron and assigns it to the variable h. Finally, it calculates the volume of the tetrahedron by multiplying the area of the base by the height and multiplying it by 1/3. The function returns the volume of the tetrahedron.
 */


function tetrahedronVolumeAnotherWay(p1, p2, p3) {
    var a = Math.sqrt(Math.pow(p2[0] - p1[0], 2) + Math.pow(p2[1] - p1[1], 2) + Math.pow(p2[2] - p1[2], 2));
    var b = Math.sqrt(Math.pow(p3[0] - p2[0], 2) + Math.pow(p3[1] - p2[1], 2) + Math.pow(p3[2] - p2[2], 2));
    var c = Math.sqrt(Math.pow(p1[0] - p3[0], 2) + Math.pow(p1[1] - p3[1], 2) + Math.pow(p1[2] - p3[2], 2));
    var s = (a + b + c) / 2;
    var area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
    var h = (2 * area) / a;
    var volume = (1/3) * area * h;
    return volume;
}

/*
The function tetrahedronVolume takes 4 parameters: 3 vertices of the triangle (v1, v2 and v3) and the base z coordinate. It creates a 4x4 matrix with these vertices and the base z coordinate. The matrix is used to calculate the volume of the tetrahedron using determinant. Finally, the function returns the absolute value of the determinant divided by 6 to get the volume of the tetrahedron.
*/
function tetrahedronVolume(v1, v2, v3, baseZ) {
    let matrix = [
        [v1[0], v1[1], v1[2], 1],
        [v2[0], v2[1], v2[2], 1],
        [v3[0], v3[1], v3[2], 1],
        [0, 0, baseZ, 1]
    ];
    return Math.abs(determinant(matrix)) / 6;
}


/*
 This function takes two parameters: point is the vertex that we want to check whether it is inside or not, vertices is an array of vertices that defines the boundaries. The function is using the Jordan curve theorem to check whether a point is inside the boundaries or not. It returns true if the point is inside the boundaries and false if the point is outside the boundaries.
 */
function determinant(matrix) {
    if (matrix.length === 2) {
        return matrix[0][0] * matrix[1][1] - matrix[1][0] * matrix[0][1];
    }

    let det = 0;
    for (let i = 0; i < matrix.length; i++) {
        let submatrix = getSubmatrix(matrix, i);
        det += (i % 2 === 0 ? 1 : -1) * matrix[0][i] * determinant(submatrix);
    }
    return det;
}


/*
 This function takes two parameters: matrix is the matrix from which we want to get the submatrix, index is the index of the row or column that we want to exclude from the submatrix. The function is using two nested loops to iterate through the matrix. If the current column is equal to the index that we want to exclude, it is skipped. Otherwise, it is added to the submatrix. Finally, the function returns the submatrix. Please note that the function assumes that the matrix is a square matrix and it is getting the submatrix by excluding one column or one row.
 */
function getSubmatrix(matrix, index) {
    let submatrix = [];
    for (let i = 1; i < matrix.length; i++) {
        let row = [];
        for (let j = 0; j < matrix.length; j++) {
            if (j !== index) {
                row.push(matrix[i][j]);
            }
        }
        if (row.length > 0) submatrix.push(row);
    }
    return submatrix;
}


