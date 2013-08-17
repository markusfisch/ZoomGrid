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
(function(){
	/**
	 * Give certain child elements a fixed width
	 *
	 * @param list - JSON list of elements to width attributes
	 * @param margin - margin width in pixels
	 * @return true on success, false otherwise
	 */
	ZoomGrid.prototype.addMaxChildWidth = function( list, margin )
	{
		var w = Math.round(
			this.container.offsetWidth-
			((this.columns-1)*(this.paddingMarginBorder.width+
				(this.frameSize ? this.frameSize.width : 0)+
				this.foldedSize.width)) )-margin;

		for( var propertyName in list )
		{
			var pat = this.parsePatterns( list[propertyName] );

			for( var n = this.cells.length; n--; )
				for( var p = pat.length; p--; )
				{
					var el = this.cells[n].getElementsByTagName( pat[p].tagName ),
						pe = pat[p];

					if( !pe.className &&
						!pe.id )
					{
						for( var e = el.length; e--; )
							el[e].style[propertyName] = w+'px';
					}
					else
					{
						for( var e = el.length; e--; )
							if( el[e].className == pe.className ||
								el[e].id == pe.id )
								el[e].style[propertyName] = w+'px';
					}
				}
		}

		return true;
	}
})();
