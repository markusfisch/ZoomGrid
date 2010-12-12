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
 * Opacity of highlighted cell
 *
 * @access protected
 * @var float
 */
ZoomGrid.prototype.opacityHighlighted = .75;

/**
 * Add highlighting to a transparent ZoomGrid
 *
 * @access public
 * @return true on success, false otherwise
 */
ZoomGrid.prototype.addHighlight = function()
{
	// check if instance has transparency extension
	if( !this.opacityFocused )
		return false;

	// highlight makes only sense when cells must be clicked
	this.zoomOnClick = true;
	this.container.onmouseout = null;

	// remove leaveContainer on parent node
	{
		var e = this.container.parentNode;

		if( !e )
			e = this.container.parentElement;

		e.onclick = this.leaveContainer;
	}

	for( var n = 0; n < this.cells.length; n++ )
	{
		this.cells[n].onclick = this.enterCell;
		this.cells[n].onmouseover = this.highlightCell;
		this.cells[n].onmouseout = this.dimCell;
	}

	return true;
}

/**
 * Add highlighting as soon as a cell was clicked
 *
 * @access public
 * @return true on success, false otherwise
 */
ZoomGrid.prototype.addHighlightOnClick = function()
{
	if( this.zoomOnClick )
		return false;

	for( var n = 0; n < this.cells.length; n++ )
		this.cells[n].onclick = this.addHighlightToCell;

	this.highlightOldRestore = this.restore;
	this.restore = function()
	{
		if( this.zoomOnClick )
		{
			this.zoomOnClick = false;
			this.container.onmouseout = this.leaveContainer;

			for( var n = 0; n < this.cells.length; n++ )
			{
				this.cells[n].onclick = this.addHighlightToCell;
				this.cells[n].onmouseover = this.enterCell;
			}
		}

		this.highlightOldRestore();
	}

	return true;
}

/**
 * Highlight cell
 *
 * @access public
 * @param ev - mouse event
 */
ZoomGrid.prototype.highlightCell = function( ev )
{
	var z;

	if( !this.zoomGrid ||
		!(z = this.zoomGrid.zoomGrid) ||
		z.active == this ||
		z.moveTimer )
		return;

	z.setOpacity( this, z.opacityHighlighted );
}

/**
 * Dim cell to normal opacity
 *
 * @access public
 * @param ev - mouse event
 */
ZoomGrid.prototype.dimCell = function( ev )
{
	// find cell division which mouse has left
	var z = null;
	var left = null;

	for( var e = this;
		e;
		e = e.parentNode )
		if( e.zoomGrid )
		{
			left = e;
			break;
		}

	if( !left ||
		!(z = left.zoomGrid.zoomGrid) ||
		z.active == this ||
		z.moveTimer )
		return;

	// find cell division which mouse has entered
	var entered = null;

	if( ev ||
		(ev = window.event) )
	{
		// try/catch because of Firefox' "permission denied error"
		// see http://code.google.com/p/fbug/issues/detail?id=2075
		// for details
		try
		{
			for( var e = ev.relatedTarget ? ev.relatedTarget : ev.toElement;
				e;
				e = e.parentNode )
				if( e.zoomGrid )
				{
					entered = e;
					break;
				}
		}
		catch( err )
		{
		}
	}

	if( left == entered )
		return;

	z.setOpacity( left, z.active ? z.opacityFolded : z.opacityUnfocused );
}

/**
 * Add highlighting calling cell
 *
 * @access public
 * @param ev - mouse event
 */
ZoomGrid.prototype.addHighlightToCell = function( ev )
{
	var z;

	if( !this.zoomGrid ||
		!(z = this.zoomGrid.zoomGrid) )
		return false;

	z.addHighlight();

	return true;
}
