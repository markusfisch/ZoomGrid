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
 * Hide given elements when cell is unfocused
 *
 * @access public
 * @param patterns - array of tag names with optional class oder id extension
 * @return true on success, false otherwise
 */
ZoomGrid.prototype.addUnfocusedHide = function( patterns )
{
	if( !patterns ||
		!patterns.length )
		return false;

	/**
	 * Called before moving begins
	 *
	 * @access protected
	 */
	this.unfocusedHideOldStartMove = this.startMove;
	this.startMove = function()
	{
		this.unfocusedHideOldStartMove();

		if( !this.active ||
			!this.active.zoomGrid )
			return;

		this.hideElements( this.active );
	}

	/**
	 * Called after moving has stopped
	 *
	 * @access protected
	 */
	this.unfocusedHideOldStopMove = this.stopMove;
	this.stopMove = function()
	{
		this.unfocusedHideOldStopMove();

		if( !this.active ||
			!this.active.zoomGrid )
			return;

		this.showElements( this.active );
	}

	// find elements to hide
	var pat = this.parsePatterns( patterns );

	for( var n = 0; n < this.cells.length; n++ )
	{
		this.cells[n].zoomGrid.elementsToHide = [];

		for( var p = 0; p < pat.length; p++ )
		{
			var el = this.cells[n].getElementsByTagName(
				pat[p].tagName )

			if( !pat[p].className &&
				!pat[p].id )
			{
				this.cells[n].zoomGrid.elementsToHide.merge( el );

				continue;
			}

			for( var e = 0; e < el.length; e++ )
				if( el[e].className == pat[p].className ||
					el[e].id == pat[p].id )
					this.cells[n].zoomGrid.elementsToHide.push( el[e] );
		}

		this.hideElements( this.cells[n] );
	}

	return true;
}

/**
 * Hide elements
 *
 * @access private
 * @param e - cell element
 */
ZoomGrid.prototype.hideElements = function( e )
{
	for( var n = 0; n < e.zoomGrid.elementsToHide.length; n++ )
		e.zoomGrid.elementsToHide[n].style.display = "none";
}

/**
 * Show elements
 *
 * @access private
 * @param e - cell element
 */
ZoomGrid.prototype.showElements = function( e )
{
	for( var n = 0; n < e.zoomGrid.elementsToHide.length; n++ )
		e.zoomGrid.elementsToHide[n].style.display = "block";
}
