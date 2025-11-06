#!/usr/bin/env python3
"""
Test inventory schema consistency issues
"""

def check_inventory_schema_issues():
    """Check for inventory schema inconsistencies in the codebase"""
    
    print("🔍 CHECKING INVENTORY SCHEMA CONSISTENCY")
    print("=" * 60)
    
    issues = []
    
    # Check models.py
    with open('/app/backend/models.py', 'r') as f:
        models_content = f.read()
        if 'inventory: Dict[str, Any]' in models_content:
            issues.append("❌ models.py defines inventory as Dict[str, Any] (object)")
    
    # Check server.py for array usage
    with open('/app/backend/server.py', 'r') as f:
        server_content = f.read()
        if "'inventory': []," in server_content:
            print("✅ server.py creates new users with inventory as array")
        
        if "inventory = user.get('inventory', {})" in server_content:
            issues.append("❌ server.py promo redemption treats inventory as dict (line ~294)")
    
    if issues:
        print("\n🚨 INVENTORY SCHEMA ISSUES FOUND:")
        for issue in issues:
            print(f"  {issue}")
        
        print("\n💡 RECOMMENDED FIXES:")
        print("  1. Update models.py: inventory: List[Dict[str, Any]] = Field(default_factory=list)")
        print("  2. Fix promo redemption code to handle array inventory")
        print("  3. Ensure all inventory operations use consistent array format")
        
        return False
    else:
        print("✅ No inventory schema issues found")
        return True

if __name__ == "__main__":
    check_inventory_schema_issues()