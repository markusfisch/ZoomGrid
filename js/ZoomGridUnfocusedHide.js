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

	for( var n = this.cells.length; n--; )
	{
		var c = this.cells[n];
		c.zoomGrid.elementsToHide = [];

		for( var p = pat.length; p--; )
		{
			var el = c.getElementsByTagName( pat[p].tagName ),
				pp = pat[p];

			if( !pp.className &&
				!pp.id )
			{
				c.zoomGrid.elementsToHide.merge( el );
				continue;
			}

			for( var e = el.length; e--; )
			{
				var ee = el[e];

				if( ee.className == pp.className ||
					ee.id == pp.id )
					c.zoomGrid.elementsToHide.push( ee );
			}
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
	e = e.zoomGrid.elementsToHide;
	for( var n = e.length; n--; )
		e[n].style.display = 'none';
}

/**
 * Show elements
 *
 * @access private
 * @param e - cell element
 */
ZoomGrid.prototype.showElements = function( e )
{
	e = e.zoomGrid.elementsToHide;
	for( var n = e.length; n--; )
		e[n].style.display = 'block';
}
