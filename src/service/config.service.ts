import { toast } from "react-toastify";

export const configApi = (contentTypeJson: boolean = true) => {
  const localToken = localStorage.getItem("token");
  const token = localToken ? localToken : "";
  
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': contentTypeJson ? 'application/json':'multipart/form-data'
    }
  }
}

export const resolveResponse = (response: any) => {
  if(response.status >= 200 && response.status < 300) {
    toast.success(response.message, {
      theme: 'colored'
    });
    return;
  };

  if(response.status >= 400 && response.status < 500) {
    if(response.status === 401) {
      toast.warn("Sessão finalizada!", {
        theme: 'colored'
      });

      setTimeout(() => {
        window.location.href = "/";
        localStorage.removeItem("token");
        localStorage.removeItem("name");
      }, 1000);
      return;
    }

    toast.warn(response?.response?.data?.message, {
      theme: 'colored'
    });
    return;
  };

  toast.error(response?.response?.data?.message, {
    theme: 'colored'
  });
};