import { os } from '../dist/index';

describe('os', () => {
	it('should get the os name', () => {
		const { name } = os;
		expect(name).to.be.a('string');
		expect(name).to.match(/windows/i);
	});

	it('should get the os version', () => {
		const { version } = os;
		expect(version).to.be.a('string');
		expect(version).to.not.equal('');
	});
});
