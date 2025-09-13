from rest_framework import permissions


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Admin users have full access, others have read-only access.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return request.user and request.user.is_authenticated and request.user.is_admin()


class IsAdminOrAssociateOrReadOnly(permissions.BasePermission):
    """
    Admin and Associate users have full access, Analysts have read-only access.
    """
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        
        if request.method in permissions.SAFE_METHODS:
            return True
        
        return request.user.is_admin() or request.user.is_associate()


class CanAccessDeal(permissions.BasePermission):
    """
    - Admin: access to all deals
    - Associate: access to deals owned by their team
    - Analyst: access to deals assigned to them
    """
    def has_object_permission(self, request, view, obj):
        user = request.user
        
        if user.is_admin():
            return True
        
        if user.is_associate():
            # For now, associate can access all deals (team logic can be added later)
            return True
        
        if user.is_analyst():
            # Analyst can only access deals they own or are assigned to
            return obj.owner == user
        
        return False


class CanAccessDocument(permissions.BasePermission):
    """
    Document access follows deal access rules.
    """
    def has_object_permission(self, request, view, obj):
        user = request.user
        
        if user.is_admin():
            return True
        
        if user.is_associate():
            return True
        
        if user.is_analyst():
            return obj.deal and obj.deal.owner == user
        
        return False