import ImageEditor from './image-editor';

window.imageEditor = new ImageEditor(
    {
        imagePath: 'http://localhost:8888/src/amsler.jpg',
        imageAltText: 'A village after dark',
        onWorkSpaceUpdated
    },
    document.querySelector( '.media-image-editor__canvas-container' )
);


// DEBUG
function onWorkSpaceUpdated( newImageEditorState ) {

    const croppedImageObj = document.querySelector( '.media-image-editor_debug__preview-container img' );
    const croppedImageAtag = document.querySelector( '.media-image-editor_debug__preview-container a' );
    const previewImage = newImageEditorState.canvas.toDataURL('image/jpeg', 0.8);
    croppedImageObj.src = previewImage;
    croppedImageObj.width = newImageEditorState.cropped.width;
    croppedImageObj.height = newImageEditorState.cropped.height;
    croppedImageAtag.href = previewImage;

    const template = `
        <li>
            <var>Original image dimensions</var>
            <samp>
                ${newImageEditorState.original.width}
                x ${newImageEditorState.original.height}
            </samp>
        </li>
        <li>
            <var>Cropped dimensions</var>
            <samp>
                ${newImageEditorState.cropped.width} x ${newImageEditorState.cropped.height}
            </samp>
        </li>
        <li><var>Cropped coordinates</var> <samp>TBD</samp></li>
        <li><var>Rotated</var> <samp>${newImageEditorState.cropped.rotated}</samp></li>
        <li><var>Ratio to original image</var> <samp>TBD</samp></li>
    `;

    document.querySelector( '.media-image-editor_debug-values ul' ).innerHTML = template;

}


