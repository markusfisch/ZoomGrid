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
 * Contruct a grid which can zoom its cells
 *
 * @access public
 * @param properties - property list in JSON format (optional)
 */
function ZoomGrid( properties )
{
	/**
	 * Number of columns
	 *
	 * @access protected
	 * @var integer
	 */
	this.columns = 0;

	/**
	 * Number of rows
	 *
	 * @access protected
	 * @var integer
	 */
	this.rows = 0;

	/**
	 * Zoom on click or mouse over
	 *
	 * @access protected
	 * @var bool
	 */
	this.zoomOnClick = false;

	/**
	 * Width and height of folded cells
	 *
	 * @access protected
	 * @var object
	 */
	this.foldedSize = { width: 0, height: 0 };

	/**
	 * Total sum of all padding, margin and border in horizontal and vertical
	 * direction; for example, for width calculate:
	 * left + right margin + border width*2 + left + right padding
	 *
	 * @access protected
	 * @var int
	 */
	this.paddingMarginBorder = { width: 0, height: 0 };

	/**
	 * Time out in miliseconds
	 *
	 * @access protected
	 * @var integer
	 */
	this.timeout = 50;

	/**
	 * Tag name of child element that should become a cell
	 *
	 * @access protected
	 * @var string
	 */
	this.tagName = "DIV";

	/**
	 * Container element
	 *
	 * @access private
	 * @var object
	 */
	this.container = null;

	/**
	 * Array of cells
	 *
	 * @access private
	 * @var array
	 */
	this.cells = [];

	/**
	 * Currently focused cell
	 *
	 * @access private
	 * @var object
	 */
	this.active = 0;

	/**
	 * Move timer
	 *
	 * @access private
	 * @var integer
	 */
	this.moveTimer = 0;

	// assign JSON property list
	if( properties )
	{
		this.assignProperties( properties );

		if( this.container )
			this.create( this.container );
	}
}

/**
 * Create zooming grid
 *
 * @access public
 * @param container - container element
 */
ZoomGrid.prototype.create = function( container )
{
	if( !container )
		return;

	if( container.style.position != 'absolute' )
		container.style.position = 'relative';

	this.container = container;

	for( var n = 0; n < container.childNodes.length; n++ )
	{
		if( container.childNodes[n].tagName != this.tagName )
			continue;

		this.cells[this.cells.length] = container.childNodes[n];
	}

	if( !this.cells.length )
		return;

	if( this.columns > 0 )
	{
		if( isNaN( this.rows ) ||
			this.rows < 1 )
			this.rows = Math.round( this.cells.length/this.columns );
	}
	else if( this.rows > 0 )
	{
		this.columns = this.cells.length;
	}
	else
		this.columns = this.rows =
			Math.round( Math.sqrt( this.cells.length ) );

	if( this.columns+this.rows < 2 )
		return;

	while( this.columns*this.rows < this.cells.length )
		this.columns++;

	for( var n = 0; n < this.cells.length; n++ )
	{
		this.cells[n].zoomGrid = { zoomGrid: this };
		this.cells[n].style.position = 'absolute';
		this.cells[n].style.overflow = 'hidden';

		if( this.zoomOnClick )
			this.cells[n].onclick = this.enterCell;
		else
			this.cells[n].onmouseover = this.enterCell;
	}

	container.zoomGrid = { zoomGrid: this };

	if( !this.zoomOnClick )
		container.onmouseout = this.leaveContainer;

	if( !this.foldedSize.width ||
		!this.foldedSize.height )
	{
		// calculate size of folded cells to leave 80% to focused cell
		this.foldedSize.width =
			this.columns > 1 ?
				Math.round( this.container.offsetWidth*.2/(this.columns-1) ) :
				0;

		this.foldedSize.height =
			this.rows > 1 ?
				Math.round( this.container.offsetHeight*.2/(this.rows-1) ) :
				0;
	}

	this.restore( true );
}

/**
 * Method to call when mouse left container
 *
 * @access public
 * @param ev - mouse event
 */
ZoomGrid.prototype.leaveContainer = function( ev )
{
	var z;

	if( !this.zoomGrid ||
		!(z = this.zoomGrid.zoomGrid) )
		return;

	// ignore events from child elements
	if( ev ||
		(ev = window.event) )
		for( var t = ev.relatedTarget ? ev.relatedTarget : ev.toElement;
			t;
			t = t.parentNode )
			if( t == z.container )
				return;

	z.restore();
}

/**
 * Method to call when mouse enters some cell
 *
 * @access public
 * @param ev - mouse event
 */
ZoomGrid.prototype.enterCell = function( ev )
{
	var z;

	if( !this.zoomGrid ||
		!(z = this.zoomGrid.zoomGrid) )
		return;

	// ignore events from child elements
	if( z.active == this )
		return;

	z.zoom( this );
}

/**
 * Restore view
 *
 * @access public
 * @param setup - true if cells should be set up directly (optional)
 */
ZoomGrid.prototype.restore = function( setup )
{
	var w = Math.round( this.container.offsetWidth/this.columns );
	var h = Math.round( this.container.offsetHeight/this.rows );
	var x = 0;
	var y = 0;
	var c = 0;

	this.clearMoveTimer();
	this.startMove();

	this.active = 0;

	for( var n = 0; n < this.cells.length; n++ )
	{
		this.cells[n].zoomGrid.left = x;
		this.cells[n].zoomGrid.top = y;
		this.cells[n].scrollLeft = "0px";
		this.cells[n].scrollTop = "0px";

		// this values are for sub classes only
		this.cells[n].zoomGrid.targetWidth = w;
		this.cells[n].zoomGrid.targetHeight = h;

		if( setup )
		{
			this.cells[n].style.left = this.cells[n].zoomGrid.left+"px";
			this.cells[n].style.top = this.cells[n].zoomGrid.top+"px";
			this.cells[n].style.width =
				(w-this.paddingMarginBorder.width)+"px";
			this.cells[n].style.height =
				(h-this.paddingMarginBorder.height)+"px";
		}

		x += w;

		if( ++c >= this.columns )
		{
			x = 0;
			y += h;
			c = 0;
		}
	}

	if( setup )
		return;

	var t = this;
	this.moveTimer = setTimeout(
		function(){ t.move(); },
		this.timeout );
}

/**
 * Zoom cell
 *
 * @access public
 * @param e - element in question
 */
ZoomGrid.prototype.zoom = function( e )
{
	var cellWidth = 0;
	var cellHeight = 0;
	var focusedWidth = 0;
	var focusedHeight = 0;
	var focusedColumn = -1;
	var focusedRow = -1;

	this.clearMoveTimer();
	this.startMove();

	this.active = 0;

	// calculate width and height of focused and unfocused cells
	{
		var columnsLeft = this.columns-1;
		var rowsLeft = this.rows-1;

		cellWidth = this.foldedSize.width;
		cellHeight = this.foldedSize.height;
		focusedWidth = Math.round(
			this.container.offsetWidth-(columnsLeft*cellWidth) );
		focusedHeight = Math.round(
			this.container.offsetHeight-(rowsLeft*cellHeight) );
	}

	// determine focused column and row
	{
		var c = 0;
		var r = 0;

		for( var n = 0; n < this.cells.length; n++ )
		{
			if( this.cells[n] == e )
			{
				this.active = e;
				focusedColumn = c;
				focusedRow = r;
				break;
			}

			if( ++c >= this.columns )
			{
				c = 0;
				r++;
			}
		}
	}

	// now lay out cells
	{
		var x = 0;
		var y = 0;
		var c = 0;
		var r = 0;

		for( var n = 0; n < this.cells.length; n++ )
		{
			var w = (c == focusedColumn ? focusedWidth : cellWidth);
			var h = (r == focusedRow ? focusedHeight : cellHeight);

			this.cells[n].zoomGrid.left = x;
			this.cells[n].zoomGrid.top = y;
			this.cells[n].scrollLeft = "0px";
			this.cells[n].scrollTop = "0px";

			// this values are for sub classes only
			this.cells[n].zoomGrid.targetWidth = w;
			this.cells[n].zoomGrid.targetHeight = h;

			x += w;

			if( ++c >= this.columns )
			{
				x = 0;
				y += h;
				c = 0;
				r++;
			}
		}
	}

	var t = this;
	this.moveTimer = setTimeout(
		function(){ t.move(); },
		this.timeout );
}

/**
 * Called before moving begins
 *
 * @access protected
 */
ZoomGrid.prototype.startMove = function()
{
	if( !this.active )
		return;

	this.active.style.overflow = 'hidden';
}

/**
 * Called while moving
 *
 * @access protected
 */
ZoomGrid.prototype.moving = function()
{
}

/**
 * Called after moving has stopped
 *
 * @access protected
 */
ZoomGrid.prototype.stopMove = function()
{
	if( !this.active )
		return;

	this.active.style.overflow = 'auto';
}

/**
 * Move cells
 *
 * @access protected
 */
ZoomGrid.prototype.move = function()
{
	var touched = false;

	// set horizontal positions
	for( var c = 0, n = 0, l = this.columns-1;
		c < this.columns;
		c++, n++ )
	{
		var d;

		if( (d = this.cells[n].zoomGrid.left-
			this.cells[n].offsetLeft) != 0 )
		{
			var s;

			if( !(s = this.calculateStep( d )) )
			{
				this.setStack(
					n,
					this.columns,
					this.rows,
					'left',
					this.cells[n].zoomGrid.left+"px" );
			}
			else
			{
				this.setStack(
					n,
					this.columns,
					this.rows,
					'left',
					(this.cells[n].offsetLeft+s)+"px" );

				touched = true;
			}
		}

		if( n > 0 )
		{
			var last = n-1;

			this.setStack(
				last,
				this.columns,
				this.rows,
				'width',
				(this.cells[n].offsetLeft-
					this.cells[last].offsetLeft-
					this.paddingMarginBorder.width)+"px" );
		}

		if( c >= l )
			this.setStack(
				n,
				this.columns,
				this.rows,
				'width',
				(this.container.offsetWidth-
					this.cells[n].offsetLeft-
					this.paddingMarginBorder.width)+"px" );
	}

	// set vertical positions
	for( var r = 0, n = 0, l = this.rows-1;
		r < this.rows;
		r++, n += this.columns )
	{
		var d;

		if( n >= this.cells.length )
			break;

		if( (d = this.cells[n].zoomGrid.top-
			this.cells[n].offsetTop) != 0 )
		{
			var s;

			if( !(s = this.calculateStep( d )) )
			{
				this.setStack(
					n,
					1,
					this.columns,
					'top',
					this.cells[n].zoomGrid.top+"px" );
			}
			else
			{
				this.setStack(
					n,
					1,
					this.columns,
					'top',
					(this.cells[n].offsetTop+s)+"px" );

				touched = true;
			}
		}

		if( n > 0 )
		{
			var last = n-this.columns;

			this.setStack(
				last,
				1,
				this.columns,
				'height',
				(this.cells[n].offsetTop-
					this.cells[last].offsetTop-
					this.paddingMarginBorder.height)+"px" );
		}

		if( r == l ||
			n+this.columns >= this.cells.length )
			this.setStack(
				n,
				1,
				this.columns,
				'height',
				(this.container.offsetHeight-
					this.cells[n].offsetTop-
					this.paddingMarginBorder.height)+"px" );
	}

	this.moving();

	if( !touched )
	{
		this.clearMoveTimer();
		this.stopMove();

		return;
	}

	var t = this;
	this.moveTimer = setTimeout(
		function(){ t.move(); },
		this.timeout );
}

/**
 * Calculate amount we want to get nearer at a time
 *
 * @access protected
 * @param d - distance in pixels
 */
ZoomGrid.prototype.calculateStep = function( d )
{
	var f = Math.round( d/2 );

	if( Math.abs( f ) < 8 )
		f = 0;

	return f;
}

/**
 * Assign JSON properties
 *
 * @access protected
 * @param properties - property list in JSON format
 */
ZoomGrid.prototype.assignProperties = function( properties )
{
	for( var name in properties )
		this[name] = properties[name];
}

/**
 * Parse given array of element patterns
 *
 * @access protected
 * @param patterns - array of tag names with optional class (.) or id (#) name
 * @return array of pattern objects
 */
ZoomGrid.prototype.parsePatterns = function( patterns )
{
	var pat = [];

	for( var i = 0; i < patterns.length; i++ )
	{
		var p;

		if( (p = patterns[i].indexOf( '.' )) > -1 )
		{
			var t = patterns[i].substr( 0, p );
			var c = patterns[i].substr( p+1 );

			pat.push( { tagName: t, className: c } );
		}
		else if( (p = patterns[i].indexOf( '#' )) > -1 )
		{
			var t = patterns[i].substr( 0, p );
			var d = patterns[i].substr( p+1 );

			pat.push( { tagName: t, id: d } );
		}
		else
			pat.push( { tagName: patterns[i] } );
	}

	return pat;
}

/**
 * Set all cells of a column or row
 *
 * @access private
 * @param i - index of first cell in column or row
 * @param s - number of elements to skip to get to the next element
 * @param m - elements in column or row
 * @param p - property name
 * @param v - new value
 */
ZoomGrid.prototype.setStack = function( i, s, m, p, v )
{
	for( var n = i; m > 0; n += s, m-- )
	{
		if( n >= this.cells.length )
			return;

		this.cells[n].style[p] = v;
	}
}

/**
 * Clear timer
 *
 * @access private
 */
ZoomGrid.prototype.clearMoveTimer = function()
{
	clearTimeout( this.moveTimer );
	this.moveTimer = 0;
}
