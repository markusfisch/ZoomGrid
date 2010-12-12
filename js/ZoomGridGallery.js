/*
 *   O         ,-
 *  ° o    . -´  '     ,-
 *   °  .´        ` . ´,´
 *     ( °   ))     . (
 *      `-;_    . -´ `.`.
 *          `._'       ´
 *
 * Copyright (c) 2010 Markus Fisch <mf@markusfisch.de>
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/mit-license.php
 */

/**
 * Create ZoomGrid for a collection of <a><img/></a> elements;
 * all (linked) images should have the same size
 *
 * @access public
 * @param container - container element
 */
ZoomGrid.prototype.createForGallery = function( container )
{
	for( var n = 0; n < container.childNodes.length; n++ )
	{
		if( container.childNodes[n].tagName != "A" )
			continue;

		var d = document.createElement( 'div' );
		d.style.backgroundImage = "url( "+container.childNodes[n].href+" )";

		container.replaceChild( d, container.childNodes[n] );
	}

	this.create( container );
}

/**
 * Size container to fit given size of focused cell
 *
 * @access public
 * @param width - desired width of focused cell
 * @param height - desired height of focused cell
 */
ZoomGrid.prototype.sizeContainerToFitAround = function( width, height )
{
	this.container.style.width = width+(this.foldedSize.width*(this.columns-1));
	this.container.style.height = height+(this.foldedSize.height*(this.rows-1));
}
