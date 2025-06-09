import { describe, it, expect, beforeEach } from 'vitest';

// Mock implementation for testing
const mockContract = {
  ipOwners: new Map(),
  admin: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  
  registerIp(sender: string, ipId: string, title: string, description: string, creationDate: number) {
    if (sender !== this.admin) {
      return { type: 'err', value: 403 };
    }
    
    if (this.ipOwners.has(ipId)) {
      return { type: 'err', value: 100 };
    }
    
    this.ipOwners.set(ipId, {
      owner: sender,
      title,
      description,
      creationDate,
      registrationDate: 123, // Mock block height
      verified: false
    });
    
    return { type: 'ok', value: true };
  },
  
  verifyIp(sender: string, ipId: string) {
    if (sender !== this.admin) {
      return { type: 'err', value: 403 };
    }
    
    if (!this.ipOwners.has(ipId)) {
      return { type: 'err', value: 404 };
    }
    
    const ipData = this.ipOwners.get(ipId);
    this.ipOwners.set(ipId, { ...ipData, verified: true });
    
    return { type: 'ok', value: true };
  },
  
  transferIpOwnership(sender: string, ipId: string, newOwner: string) {
    if (!this.ipOwners.has(ipId)) {
      return { type: 'err', value: 404 };
    }
    
    const ipData = this.ipOwners.get(ipId);
    if (sender !== ipData.owner) {
      return { type: 'err', value: 403 };
    }
    
    this.ipOwners.set(ipId, { ...ipData, owner: newOwner });
    
    return { type: 'ok', value: true };
  },
  
  getIpOwner(ipId: string) {
    return this.ipOwners.has(ipId) ? this.ipOwners.get(ipId) : null;
  },
  
  isIpVerified(ipId: string) {
    return this.ipOwners.has(ipId) ? this.ipOwners.get(ipId).verified : false;
  }
};

describe('IP Owner Verification Contract', () => {
  beforeEach(() => {
    mockContract.ipOwners.clear();
  });
  
  it('should register new IP', () => {
    const result = mockContract.registerIp(
        mockContract.admin,
        'ip-123',
        'My Artwork',
        'A beautiful digital painting',
        1625097600
    );
    
    expect(result.type).toBe('ok');
    expect(mockContract.ipOwners.has('ip-123')).toBe(true);
  });
  
  it('should fail to register IP with non-admin user', () => {
    const result = mockContract.registerIp(
        'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG',
        'ip-123',
        'My Artwork',
        'A beautiful digital painting',
        1625097600
    );
    
    expect(result.type).toBe('err');
    expect(result.value).toBe(403);
  });
  
  it('should fail to register duplicate IP', () => {
    mockContract.registerIp(
        mockContract.admin,
        'ip-123',
        'My Artwork',
        'A beautiful digital painting',
        1625097600
    );
    
    const result = mockContract.registerIp(
        mockContract.admin,
        'ip-123',
        'Another Artwork',
        'Another description',
        1625097600
    );
    
    expect(result.type).toBe('err');
    expect(result.value).toBe(100);
  });
  
  it('should verify IP', () => {
    mockContract.registerIp(
        mockContract.admin,
        'ip-123',
        'My Artwork',
        'A beautiful digital painting',
        1625097600
    );
    
    const result = mockContract.verifyIp(mockContract.admin, 'ip-123');
    
    expect(result.type).toBe('ok');
    expect(mockContract.isIpVerified('ip-123')).toBe(true);
  });
  
  it('should transfer IP ownership', () => {
    mockContract.registerIp(
        mockContract.admin,
        'ip-123',
        'My Artwork',
        'A beautiful digital painting',
        1625097600
    );
    
    const newOwner = 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG';
    const result = mockContract.transferIpOwnership(mockContract.admin, 'ip-123', newOwner);
    
    expect(result.type).toBe('ok');
    expect(mockContract.getIpOwner('ip-123').owner).toBe(newOwner);
  });
});
