import Editor from './image-editor';

window.imageEditor = new Editor(
    {
        imagePath: 'http://localhost:8888/src/amsler.jpg',
        imageAltText: 'A village after dark',
        onWorkSpaceUpdated
    },
    document.querySelector( '.media-image-editor__canvas-container' )
);


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

}


