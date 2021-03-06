import { Component } from './core.js';

export class TableComponent extends Component
{
	constructor(tableSelector, props) {
		super(props);
		this.scrollY = '50vh';

		if (tableSelector === undefined || tableSelector === null) {
			tableSelector = 'table';
		}

		this.tableSelector = tableSelector;
		this.options = {};
		this.columns = [];
	}

	limitChars(text, max) {
		if (text.length > max) {
			return text.substr(0, max - 3) + '...';
		}
		return text;
	}

	setOption(key, value) {
		this.options[key] = value;
	}

	getOption(key) {
		return this.options[key];
	}
	
	create(options) {
		let id = options.id ?? null;
		let header = options.header ?? null;
		let data = options.data ?? null;
		let fields = options.fields ?? null;
		let footer = options.footer ?? null;
		let classes = options.classes ?? null;
		let tr_classes = options.tr_classes ?? null;
		let td_classes = options.td_classes ?? null;
		let columns = options.columns ?? null;
		let tr = options.tr ?? null;
		let td = options.td ?? null;
		
		if (header === null || header === undefined) {
			header = [];
		}
		if (data === null || data === undefined) {
			data = [];
		}
		if (fields === null || fields === undefined) {
			fields = {};
		}
		if (footer === null || footer === undefined) {
			footer = [];
		}
		if (classes === null || classes === undefined) {
			classes = 'table table-sm table-responsive d-block d-md-table table-striped';
		}
		if (columns === null || columns === undefined) {
			columns = header.map(i => {
				return {
					width: "auto",
					visible: true
				};
			});
		} else {
			columns = columns.map(c => {
				return {
					width: c.width ?? "auto",
					visible: c.visible ?? true
				};
			});
		}
		if (tr_classes === null || tr_classes === undefined) {
			tr_classes = '';
		}
		if (td_classes === null || td_classes === undefined) {
			td_classes = '';
		}
		if (tr === null || tr === undefined) {
			tr = r => '';
		}
		if (td === null || td === undefined) {
			td = (f, v) => '';
		}

		const format = fields;
		fields = [];

		for (let key in format) {
			fields.push(key);
		}
		
		this.columns = columns;

		return `
			<table id="${id}" class="${classes}">
				<thead class="thead">
					<tr class="">
						${
							header.map(
								(th, key) => `<th style="width: ${columns[key].width}">${th}</th>`
							).join('')
						}
					</tr>
				</thead>
				
				<tbody class="tbody">
					${
						data.map(
							(row, index) => `
								<tr class="${tr_classes}" ${tr(row, index)}>
									${
										fields.map(
											(field, key) => `
												<td style="width: ${columns[key].width}" class="${td_classes}" ${td(field, key, row[field])}>
													${
														(field in format)
															? format[field](row[field])
															: row[field]
													}
												</td>
											`
										).join('')
									}
								</tr>
							`
						).join('')
					}
				</tbody>
				
				<tfoot class="tfoot">
					<tr class="">
						${
							footer.map(
								(td, key) => `<td style="width: ${columns[key].width}">${td}</td>`
							).join('')
						}
					</tr>
				</tfooter>
			</table>
		`;
	}

	reload() {
		super.reload();

		const options = {
			"paging": true,
			"ordering": true,
			"info": true,
			"scrollY": this.scrollY,
			"scrollCollapse": true,
			"fnDrawCallback": oSettings => {
				$(oSettings.nTableWrapper).find('.pagination li:not(.active) *').addClass('text-info');
				$(oSettings.nTableWrapper).find('.pagination li.active *').addClass('bg-info');
				if (oSettings._iDisplayLength >= oSettings.fnRecordsDisplay()) {
					$(oSettings.nTableWrapper).find('.dataTables_paginate').hide();
				} else {
					$(oSettings.nTableWrapper).find('.dataTables_paginate').show();
				}
			},
			"fnInitComplete": () => {
				$(this.tableSelector).show();
			}
		};

		for (const key in this.options) {
			options[key] = this.options[key];
		}

		$(() => {
			let table = null;
			$(this.tableSelector).hide();
			
			if ($.fn.dataTable.isDataTable(this.tableSelector)) {
				table = $(this.tableSelector).DataTable();
			} else {
				table = $(this.tableSelector).DataTable(options);
			}

			for (let index in this.columns) {
				table.column(index).visible(this.columns[index].visible);
			}
			
			$('a[data-toggle="tab"]').on('shown.bs.tab', function(e){
			   $($.fn.dataTable.tables(true)).DataTable().columns.adjust();
			});
		});
	}
}

export class FormComponent extends Component
{
	constructor(props) {
		super(props);
	}

	addFieldControl(name, value) {
		Object.defineProperty(this.controlNames, name, value);
	}

	setFieldsControls(controls) {
		this.controlNames = {};
		for (const key in controls) {
			this.addFieldControl(key, controls[key]);
		}
	}

	__onInput(event, target) {
		this.controlNames[target] = event.target.value;
		event.target.value = this.controlNames[target]
	}

	__renderAttributes(attributes) {
		return attributes.map(
			attr => {
				return `${attr.name}="${
					Array.isArray(attr)
						?	attr.join(' ')
						:	attr.value
				}"`;
			}
		).join(' ');
	}

	input(options) {
		const attributes = [];

		const defaultOptions = {
			type: 'text',
			fieldControlName: '',
			events: ['onkeyup', 'onchange'],
			value: this.controlNames[options.fieldControlName]
		};

		for (const key in defaultOptions) {
			if (options[key] === undefined) {
				options[key] = defaultOptions[key];
			}
		}

		for (const key in options) {
			attributes.push({
				name: key,
				value: options[key]
			});
		}

		for (const event of options.events) {
			attributes.push({
				name: event,
				value: `this.component.__onInput(event, '${options.fieldControlName}')`
			});
		}

		delete options.events;
		delete options.fieldControlName;

		return `<input ${this.__renderAttributes(attributes)}>`;
	}
}

export class ModalComponent extends Component
{
	constructor(contentClass, ...args) {
		super();
		this.onOpen = this.onClose = () => null;
		this.__content = new contentClass(this, ...args);
	}

	show(selector) {
		super.show(selector);
		this.appendChild(
			this.__content,
			`${selector}>.modal>.modal-dialog>.modal-content`
		)
	}

	getContent() {
		return this.__content;
	}

	setOnOpen(callback) {
		this.onOpen = callback;
	}

	setOnClose(callback) {
		this.onClose = callback;
	}

	register(object) {
		for (const key in object) {
			this[key] = object[key];
		}
	}

	open() {
		const options = {
			backdrop: 'static',
			keyboard: false,
			focus: true
		};
		const modalSelect = $(`${this.selector}>.modal`);
		modalSelect.modal(options);
		modalSelect.on('shown.bs.modal', () => this.onOpen());
	}

	close() {
		const modalSelect = $(`${this.selector}>.modal`);
		modalSelect.modal('hide');
		modalSelect.on('hidden.bs.modal', () => {
			this.onClose();
		});
	}

	render() {
		return `
			<div class="modal fade custom-size" .modal" tabindex="-1" role="dialog" aria-hidden="true">
				<div class="modal-dialog ${this.dataset.classes || ''}" role="document">
					<div class="modal-content"></div>
				</div>
			</div>
		`;
	}
}