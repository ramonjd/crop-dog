import Editor from './image-editor';

window.imageEditor = new Editor(
    {
        imagePath: 'http://localhost:8888/src/amsler.jpg',
        imageAltText: 'A village after dark',
        onWorkSpaceUpdated
    },
    document.querySelector( '.media-image-editor__canvas-container' )
);

function exportEditedImage() {
// Get a reference to the canvas element
    const previewImg = document.querySelector('.media-image-editor_debug__preview-container img');

// Get the data URI of the canvas image
    const dataURI = window.imageEditor.canvasWorkspace.exportImageURI();



// Append the image element to the document
    previewImg.src = dataURI;

//     In this example, myCanvas is the ID of the canvas element in the HTML document. The toDataURL method returns a data URI that represents the contents of the canvas as a PNG image. The data URI is assigned to the src attribute of a new image element, which is then appended to the document. This will display the canvas image on the page.
//
//         You can also use the toBlob method to export the canvas as a Blob object, which can be used for further processing or saving to a file. Here's an example:
//
//     javascript
//     Copy code
//     canvas.toBlob(function(blob) {
//         // Use the Blob object here
//     });
}


// DEBUG
function onWorkSpaceUpdated( state ) {
    //const croppedImageObj = document.querySelector( '.media-image-editor_debug__preview-container img' );
    //const croppedImageAtag = document.querySelector( '.media-image-editor_debug__preview-container a' );
    //const previewImage = newImageEditorState.canvas.toDataURL('image/jpeg', 0.8 );
    //croppedImageObj.src = previewImage;
    //croppedImageObj.width = newImageEditorState.cropped.width;
    //croppedImageObj.height = newImageEditorState.cropped.height;
    //croppedImageAtag.href = previewImage;

    const template = `
        <li>
            <var>App container dimensions</var>
            <samp>
                ${ state.appContainer.width } x ${ state.appContainer.height }
            </samp>
        </li>
        <li>
            <var>Original image dimensions</var>
            <samp>
                ${ state.image.originalWidth } x ${ state.image.originalHeight  }
            </samp>
        </li>
		<li>
			<var>Scaled image dimensions</var>
			<samp>
				${ state.image.width } x ${ state.image.height }
			</samp>
		</li>
        <li>
			<var>Ratio to original image</var>
			<samp>${ state.image.ratio }</samp>
        </li>
         <li>
            <var>Image coordinates relative to window</var>
            <samp>
                left: ${ state.image.left }, top:  ${ state.image.top  }
            </samp>
        </li>
         <li>
            <var>Crop container height and width</var>
            <samp>
                ${ state.cropContainer.width } x ${ state.cropContainer.height }
            </samp>
        </li>
         <li>
            <var>Crop container coordinates relative to window</var>
            <samp>
                left: ${ state.cropContainer.left }, top:  ${ state.cropContainer.top  },
                right: ${ state.cropContainer.right }, bottom:  ${ state.cropContainer.bottom  }
            </samp>
        </li>
    `;

    document.querySelector( '.media-image-editor_debug-values ul' ).innerHTML = template;
    document.querySelector( '.media-image-editor_debug-values ul' ).innerHTML = template;
    exportEditedImage();
}


