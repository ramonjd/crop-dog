import ImageEditor from './image-editor';

const imageEditor = new ImageEditor(
    {
        imagePath: 'http://localhost:8888/src/A-Village-After-Dark.jpg',
        imageAltText: 'A village after dark',
        onWorkSpaceUpdated
    },
    document.querySelector( '.media-image-editor__canvas-container' )
);


// TOOL BAR FUNCTIONS

document.querySelector( '.media-image-editor__tool-button-reset' )
    .addEventListener( 'click', event => {
        imageEditor.reset();
    }, false);


// DEBUG
function onWorkSpaceUpdated( newImageEditorState ) {

    console.info( 'newImageEditorState', newImageEditorState );

    document.querySelector( '.media-image-editor_debug__preview-container img' )
        .src = newImageEditorState.canvas.toDataURL('image/png');

    const template = `
        <li>
            <var>Original image dimensions</var> 
            <samp>
                ${newImageEditorState.image.originaDimensions.width} 
                x ${newImageEditorState.image.originaDimensions.height}
            </samp>
        </li>
        <li>
            <var>Cropped dimensions</var> 
            <samp>
                ${newImageEditorState.bounds.right - newImageEditorState.bounds.left} 
                x ${newImageEditorState.bounds.bottom - newImageEditorState.bounds.top}
            </samp>
        </li>
        <li><var>Cropped coordinates</var> <samp>TBD</samp></li>
        <li><var>Rotation</var> <samp>TBD</samp></li>
        <li><var>Ratio to original image</var> <samp>TBD</samp></li>
    `;

    document.querySelector( '.media-image-editor_debug-values ul' ).innerHTML = template;

}


