# ArgoCD Setup Guide for Dress Dock Flow

## ✅ ArgoCD Installation Complete!

ArgoCD has been successfully installed in your Kubernetes cluster.

## Access ArgoCD UI

### Option 1: Port Forward (Recommended for local development)

Run this command in a **separate terminal window**:

```powershell
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

Then access ArgoCD at: **https://localhost:8080**

### Option 2: Using kubectl proxy

```powershell
kubectl proxy
```

Then access at: http://localhost:8001/api/v1/namespaces/argocd/services/https:argocd-server:/proxy/

## Login Credentials

**Username:** `admin`

**Password:** Get it by running:

```powershell
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | ForEach-Object { [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($_)) }
```

Or manually decode the base64 password:
```powershell
# Get the base64 password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}"

# Output: bWtKOHJPMzdzcGRhQjhydQ==
# Decoded password: mkJ8rO37spdaB8ru
```

**Your initial password is:** `mkJ8rO37spdaB8ru`

## Deploy Your Application with ArgoCD

### Step 1: Apply the ArgoCD Application

```powershell
kubectl apply -f k8s/argocd/application.yaml
```

### Step 2: Verify the Application

```powershell
# Check ArgoCD application status
kubectl get applications -n argocd

# Get detailed status
kubectl describe application dress-dock-flow -n argocd
```

### Step 3: Access ArgoCD UI

1. Open **https://localhost:8080** (after port-forward)
2. Login with:
   - Username: `admin`
   - Password: `mkJ8rO37spdaB8ru`
3. You should see your `dress-dock-flow` application

## ArgoCD Features Enabled

Your application is configured with:

✅ **Automated Sync** - Changes in Git are automatically applied
✅ **Self-Healing** - Manual changes are automatically corrected
✅ **Pruning** - Removed resources from Git are deleted from cluster
✅ **Auto-Create Namespace** - Namespace is created if it doesn't exist

## Useful ArgoCD Commands

### View Applications
```powershell
kubectl get applications -n argocd
```

### Sync Application Manually
```powershell
kubectl -n argocd patch application dress-dock-flow --type merge -p '{\"spec\":{\"syncPolicy\":{\"syncOptions\":[\"CreateNamespace=true\"]}}}'
```

### Get Application Status
```powershell
kubectl get application dress-dock-flow -n argocd -o yaml
```

### View ArgoCD Logs
```powershell
# Server logs
kubectl logs -n argocd deployment/argocd-server

# Application controller logs
kubectl logs -n argocd statefulset/argocd-application-controller
```

### Delete Application (without deleting resources)
```powershell
kubectl delete application dress-dock-flow -n argocd
```

## Change Admin Password

After first login, change the password:

```powershell
# Using ArgoCD CLI (if installed)
argocd account update-password

# Or through the UI: User Info > Update Password
```

## Install ArgoCD CLI (Optional)

### Windows (using Chocolatey)
```powershell
choco install argocd-cli
```

### Windows (manual download)
Download from: https://github.com/argoproj/argo-cd/releases/latest

Then add to PATH.

### Using ArgoCD CLI

```powershell
# Login
argocd login localhost:8080 --username admin --password mkJ8rO37spdaB8ru --insecure

# List applications
argocd app list

# Get application details
argocd app get dress-dock-flow

# Sync application
argocd app sync dress-dock-flow

# View application logs
argocd app logs dress-dock-flow
```

## Troubleshooting

### Application Not Syncing

```powershell
# Check application status
kubectl describe application dress-dock-flow -n argocd

# Check ArgoCD server logs
kubectl logs -n argocd deployment/argocd-server --tail=50

# Force sync
kubectl -n argocd patch application dress-dock-flow --type merge -p '{\"metadata\":{\"annotations\":{\"argocd.argoproj.io/refresh\":\"hard\"}}}'
```

### Can't Access UI

```powershell
# Check if port-forward is running
# Make sure you have this running in a separate terminal:
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Check ArgoCD server status
kubectl get pods -n argocd
kubectl get svc -n argocd
```

### Reset Admin Password

```powershell
# Delete the secret to regenerate
kubectl -n argocd delete secret argocd-initial-admin-secret

# Restart ArgoCD server
kubectl -n argocd rollout restart deployment argocd-server
```

## GitOps Workflow

1. **Make changes** to your Kubernetes manifests in the `k8s/` directory
2. **Commit and push** to your Git repository
3. **ArgoCD automatically detects** the changes
4. **ArgoCD syncs** the changes to your cluster
5. **Monitor** the deployment in the ArgoCD UI

## Uninstall ArgoCD

If you need to remove ArgoCD:

```powershell
# Delete the application first
kubectl delete -f k8s/argocd/application.yaml

# Delete ArgoCD
kubectl delete -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Delete namespace
kubectl delete namespace argocd
```

## Next Steps

1. ✅ Access ArgoCD UI at https://localhost:8080
2. ✅ Login with admin credentials
3. ✅ Deploy your application: `kubectl apply -f k8s/argocd/application.yaml`
4. ✅ Watch your application sync automatically
5. ✅ Make changes to k8s manifests and push to Git
6. ✅ See ArgoCD automatically deploy your changes

## Resources

- ArgoCD Documentation: https://argo-cd.readthedocs.io/
- ArgoCD GitHub: https://github.com/argoproj/argo-cd
- Getting Started Guide: https://argo-cd.readthedocs.io/en/stable/getting_started/

---

**Your ArgoCD is ready to use! 🚀**
