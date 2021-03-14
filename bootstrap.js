import { Component } from './core.js';

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