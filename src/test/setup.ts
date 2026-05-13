import '@testing-library/jest-dom'

// Mock per evitare "Error: Not implemented: navigation (except hash changes)" in JSDOM
// quando si usa a.click() per il download di file
const originalClick = HTMLAnchorElement.prototype.click
HTMLAnchorElement.prototype.click = function () {
	if (this.href.startsWith('blob:') || this.download) {
		return
	}
	originalClick.call(this)
}
