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
 * Disable links when cell is folded
 *
 * @access public
 * @return true on success, false otherwise
 */
ZoomGrid.prototype.addDisableFoldedLinks = function()
{
	for( var n = 0; n < this.cells.length; n++ )
	{
		var a = this.cells[n].getElementsByTagName( "a" );

		if( !a ||
			!a.length )
			continue;

		for( var i = 0; i < a.length; i++ )
		{
			a[i].disableZoomGrid = this;
			a[i].disableCell = this.cells[n];
			a[i].disableFoldedOldClick = a[i].onclick;
			a[i].onclick = function( ev )
			{
				if( this.disableCell != this.disableZoomGrid.active )
					return false;

				return this.disableFoldedOldClick ?
					this.disableFoldedOldClick() :
					true;
			}
		}
	}

	return true;
}
