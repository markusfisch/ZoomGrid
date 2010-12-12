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
 * Give certain child elements a fixed width
 *
 * @access public
 * @param list - JSON list of elements to width attributes
 * @return true on success, false otherwise
 */
ZoomGrid.prototype.addMaxChildWidth = function( list )
{
	// reserve about 24 px for the scroll bar
	var w = Math.round(
		this.container.offsetWidth-
		((this.columns-1)*(this.paddingMarginBorder.width+
			(this.frameSize ? this.frameSize.width : 0)+
			this.foldedSize.width)) )-24;

	for( var propertyName in list )
	{
		var pat = this.parsePatterns( list[propertyName] );

		for( var n = 0; n < this.cells.length; n++ )
			for( var p = 0; p < pat.length; p++ )
			{
				var el = this.cells[n].getElementsByTagName(
					pat[p].tagName )

				if( !pat[p].className &&
					!pat[p].id )
				{
					for( var e = 0; e < el.length; e++ )
						el[e].style[propertyName] = w+"px";
				}
				else
				{
					for( var e = 0; e < el.length; e++ )
						if( el[e].className == pat[p].className ||
							el[e].id == pat[p].id )
							el[e].style[propertyName] = w+"px";
				}
			}
	}

	return true;
}
