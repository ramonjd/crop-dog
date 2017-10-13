# crop-dog

*Very early stage of work in progress.*

`npm start`
`npm run webpack`

## Aim

To create a standalone cropping tool module, consisting of three layers, stacked in the following order:

### Animation layer
Comprising an image that scales and responds via style.translate to manipulations in the cropping layer.

### Workspace (canvas) layer

Represents the translation of the cropping layer coordinates over the underlying source image

### Cropping tool layer
Resizable rectangle, whose dimensions scale and translate the animation layer.  

The scaled { x, y, width, height } of the image that appears within the boundaries of the cropping tool is mapped to the source image.

Using the source data, we map a scaled version to the canvas layer


## Notes
The scaling math between the animation layer, which uses CSS3 transform: scale, translate, and rotate and the working layer is the bit that will take the most time.
At least for me. Ratio and reverse scaling calculations need to be written and probably unit tested as well.


## Work in progress
1. Create (b) image and (c) cropping area layers 
2. Define basic data structure and flow  What does our tool need to know about the world, and what data does it need to make available  
3. Plugin crop handle events, and boundary calculations  
4. Image layer drag 
5. Scaling/ratio calc and functionality
6. Constraints and aspect ratios
7. Reflection
8. Rotation tool and algorithm.
9. Image getter service. A simple XHR call to get the message and handle callback and errors.
10. Image exporter handling (canvasToBlob with associated MimeTypes)
11. Reset functionality
12. Keyboard accessibility Arrow keys should resize crop area


## Future iterations
Implement granular rotation

`npm start`

http://localhost:8888/src/index.html

1. Create image (animation) layer, canvas (working layer), and drag layer.
2. Create draggable crop areas with shift
3. Implement scaling/ratios 
4. Implement rotate
5. Implement mirror