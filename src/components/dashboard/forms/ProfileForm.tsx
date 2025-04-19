"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import ImageUploadButton from "@/components/UploadImage";
import { useState, useEffect } from "react";
import { getUserProfile, updateProfile } from "@/actions/admin/profileActions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { profileFormSchema, type SocialLinks } from "@/types/profile";
import Image from "next/image";
import { AlertTriangle, Check, Loader2 } from "lucide-react";

// Type for form data that ensures compatibility with the form library
type FormData = {
  bio: string;
  avatar: string;
  position: string;
  socialLinks: SocialLinks;
};

export default function ProfileForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({
    website: "",
  });
  const [formChanged, setFormChanged] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitted },
    watch,
    trigger,
  } = useForm<FormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      bio: "",
      avatar: "",
      position: "",
      socialLinks: {
        website: "",
      },
    },
    mode: "onChange",
  });

  // Debug errors when form is submitted
  useEffect(() => {
    if (isSubmitted) {
      console.log("Form validation errors:", errors);
    }
  }, [isSubmitted, errors]);

  // Watch for form changes
  useEffect(() => {
    const subscription = watch(() => {
      setFormChanged(true);
      // Trigger validation when form values change
      if (isSubmitted) {
        trigger();
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, isSubmitted, trigger]);

  // Load existing profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        setPermissionError(null);
        console.log("Loading profile data...");
        const result = await getUserProfile();

        if (result.success && result.data) {
          const profile = result.data;
          console.log("Successfully loaded profile data:", profile);

          // Set form values for all fields from Prisma schema
          setValue("bio", profile.bio || "");
          setValue("avatar", profile.avatar || "");
          setValue("position", profile.position || "");

          // Handle social links
          const defaultSocialLinks = {
            website: "",
          };

          let parsedLinks = defaultSocialLinks;

          if (profile.socialLinks) {
            // Ensure all required fields are present by spreading default values first
            parsedLinks = { ...defaultSocialLinks, ...profile.socialLinks };
          }

          console.log("Social links from profile:", parsedLinks);
          setSocialLinks(parsedLinks);
          setValue("socialLinks", parsedLinks);

          // Set local state
          setAvatarUrl(profile.avatar || "");
          setFormChanged(false); // Reset form changed status after loading
        } else {
          console.error("Failed to load profile:", result.error);
          // Don't show error toast for new users - they just don't have a profile yet
          if (result.error && !result.error.includes("not found")) {
            toast.error("Failed to load profile data: " + result.error);

            // Check if it's a permission error
            if (result.error.includes("permission")) {
              setPermissionError(result.error);
            }
          }
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        toast.error("Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [setValue]);

  // Handle avatar upload
  const handleAvatarUpload = (url: string) => {
    console.log("Avatar uploaded:", url);
    setAvatarUrl(url);
    setValue("avatar", url, { shouldValidate: true });
    setFormChanged(true);
  };

  // Handle social link change
  const handleSocialLinkChange = (
    platform: keyof SocialLinks,
    value: string
  ) => {
    const updatedLinks = { ...socialLinks, [platform]: value };
    setSocialLinks(updatedLinks);
    setValue("socialLinks", updatedLinks, { shouldValidate: true });
    setFormChanged(true);
  };

  // Form submission handler
  const onSubmit = async (data: FormData) => {
    console.log("Form submission started with data:", data);
    setIsSubmitting(true);

    const loadingToast = toast.loading("Saving profile...");

    try {
      // Ensure validation before submission
      const isValid = await trigger();
      if (!isValid) {
        toast.dismiss(loadingToast);
        toast.error("Please fix the validation errors before submitting");
        setIsSubmitting(false);
        return;
      }

      // Ensure the socialLinks is properly serialized before sending
      const formattedData = {
        ...data,
        socialLinks: data.socialLinks || { website: "" },
      };

      console.log("Formatted data for submission:", formattedData);

      // Call the direct update function with the form values
      const result = await updateProfile(
        formattedData.bio || "",
        formattedData.position || "",
        formattedData.avatar || "",
        formattedData.socialLinks
      );

      console.log("Profile update result:", result);

      toast.dismiss(loadingToast);

      if (!result || !result.success) {
        const errorMsg = result?.error || "Failed to update profile";
        console.error("Profile update failed:", errorMsg);
        toast.error(errorMsg);

        // Check if it's a permission error
        if (errorMsg.includes("permission")) {
          setPermissionError(errorMsg);
        }

        return;
      }

      console.log("Profile updated successfully:", result.data);

      // Show success message and dialog
      toast.success("Profile updated successfully!");
      setSuccessDialogOpen(true);
      setFormChanged(false);
      router.refresh(); // Refresh the page data
    } catch (error) {
      console.error("Error submitting profile form:", error);
      toast.dismiss(loadingToast);
      toast.error("An unexpected error occurred while updating your profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (formChanged) {
      setCancelDialogOpen(true);
    } else {
      router.back();
    }
  };

  const confirmCancel = () => {
    setCancelDialogOpen(false);
    router.back();
  };

  const handleSuccessContinue = () => {
    setSuccessDialogOpen(false);
    router.push("/dashboard");
    router.refresh();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-lg">Loading profile data...</p>
        </div>
      </div>
    );
  }

  if (permissionError) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-4 text-lg font-semibold">Permission Error</h3>
          <p className="mt-2 text-gray-600">{permissionError}</p>
          <Button className="mt-4" onClick={() => router.push("/dashboard")}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Card className="w-full shadow-sm">
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-8">
            {/* Avatar */}
            <div className="space-y-2">
              <Label
                htmlFor="avatar"
                className={errors.avatar ? "text-red-500" : ""}
              >
                Profile Picture <span className="text-red-500">*</span>
              </Label>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div>
                  <ImageUploadButton onImageUpload={handleAvatarUpload} />
                  <input
                    type="hidden"
                    id="avatar"
                    {...register("avatar")}
                    value={avatarUrl}
                  />
                </div>
                {avatarUrl && (
                  <div className="mt-2 sm:mt-0">
                    <div className="relative rounded-full overflow-hidden border border-gray-200 shadow-sm h-16 w-16">
                      <Image
                        src={avatarUrl}
                        alt="Avatar Preview"
                        className="object-cover"
                        fill
                      />
                    </div>
                  </div>
                )}
              </div>
              {errors.avatar && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.avatar.message}
                </p>
              )}
            </div>

            {/* Position */}
            <div className="space-y-2">
              <Label
                htmlFor="position"
                className={errors.position ? "text-red-500" : ""}
              >
                Job Position <span className="text-red-500">*</span>
              </Label>
              <Input
                id="position"
                {...register("position")}
                placeholder="Your job title or position"
                className={`w-full ${errors.position ? "border-red-500" : ""}`}
              />
              {errors.position && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.position.message}
                </p>
              )}
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio" className={errors.bio ? "text-red-500" : ""}>
                Bio <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="bio"
                {...register("bio")}
                placeholder="Tell us a bit about yourself"
                className={`min-h-32 ${errors.bio ? "border-red-500" : ""}`}
              />
              {errors.bio && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.bio.message}
                </p>
              )}
            </div>

            {/* Social Links */}
            <div className="space-y-4">
              <Label>Social Links</Label>
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="website" className="text-sm">
                    Website
                  </Label>
                  <Input
                    id="website"
                    placeholder="https://your-website.com"
                    value={socialLinks.website || ""}
                    onChange={(e) =>
                      handleSocialLinkChange("website", e.target.value)
                    }
                    className={
                      errors.socialLinks?.website ? "border-red-500" : ""
                    }
                  />
                  {errors.socialLinks?.website && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.socialLinks.website.message}
                    </p>
                  )}
                </div>
              </div>
              {errors.socialLinks && typeof errors.socialLinks === "string" && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.socialLinks}
                </p>
              )}
            </div>

            {/* Required field notice */}
            <div className="text-sm text-gray-500">
              Fields marked with <span className="text-red-500">*</span> are
              required
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Confirm Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Discard Changes?</DialogTitle>
            <DialogDescription>
              You have unsaved changes. Are you sure you want to discard them?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
            >
              Continue Editing
            </Button>
            <Button variant="destructive" onClick={confirmCancel}>
              Discard Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              Profile Updated
            </DialogTitle>
            <DialogDescription>
              Your profile has been successfully updated.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleSuccessContinue}>
              Continue to Dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
