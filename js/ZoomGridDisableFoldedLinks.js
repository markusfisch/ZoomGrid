/*
 *   O         ,-
 *  ° o    . -´  '     ,-
 *   °  .´        ` . ´,´
 *     ( °   ))     . (
 *      `-;_    . -´ `.`.
 *          `._'       ´
 *
 * 2010,2012 Markus Fisch <mf@markusfisch.de>
 * Public Domain
 */
"use strict";

/**
 * Disable links when cell is folded
 *
 * @return true on success, false otherwise
 */
ZoomGrid.prototype.addDisableFoldedLinks = function()
{
	for( var n = this.cells.length; n--; )
	{
		var c = this.cells[n],
			a = c.getElementsByTagName( 'a' );

		if( !a )
			continue;

		for( var i = a.length; i--; )
		{
			var ai  = a[i];

			ai.disableZoomGrid = this;
			ai.disableCell = c;
			ai.disableFoldedOldClick = ai.onclick;
			ai.onclick = function( ev )
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
