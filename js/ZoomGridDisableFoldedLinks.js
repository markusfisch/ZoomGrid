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
