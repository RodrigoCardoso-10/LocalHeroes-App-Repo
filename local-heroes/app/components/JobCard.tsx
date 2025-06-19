import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface LocationObject {
  point?: any;
  address?: string;
  _id?: string;
}

interface JobCardProps {
  job: {
    _id: string;
    title: string;
    description: string;
    location?: string | LocationObject;
    price: number;
    category?: string;
    tags?: string[];
    status: string;
    postedBy: {
      firstName?: string;
      lastName?: string;
    };
  };
  onPress: () => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onPress }) => {
  // Helper for getting display address
  const getLocationAddress = (
    location: JobCardProps["job"]["location"]
  ): string => {
    if (!location) {
      return "Unknown Location";
    }
    if (location.address) {
      return location.address;
    }
    if (location.point?.coordinates) {
      return `${location.point.coordinates[1].toFixed(
        4
      )}, ${location.point.coordinates[0].toFixed(4)}`;
    }
    return "Unknown Location";
  };

  // Helper for status badge style
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "OPEN":
        return { backgroundColor: "#E8F5E8" };
      case "IN_PROGRESS":
        return { backgroundColor: "#FFF3CD" };
      case "COMPLETED":
        return { backgroundColor: "#D1ECF1" };
      case "CANCELLED":
        return { backgroundColor: "#F8D7DA" };
      default:
        return { backgroundColor: "#E9ECEF" };
    }
  };
  const getStatusTextStyle = (status: string) => {
    switch (status) {
      case "OPEN":
        return { color: "#155724" };
      case "IN_PROGRESS":
        return { color: "#856404" };
      case "COMPLETED":
        return { color: "#0C5460" };
      case "CANCELLED":
        return { color: "#721C24" };
      default:
        return { color: "#495057" };
    }
  };
  const poster = job.postedBy || {};
  const firstName =
    typeof poster.firstName === "string" ? poster.firstName : "Unknown";
  const lastName = typeof poster.lastName === "string" ? poster.lastName : "";
  const avatarLetter = firstName.charAt(0) || "U";
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{job.title}</Text>
        <Text style={styles.price}>€{job.price}</Text>
      </View>
      <Text style={styles.description} numberOfLines={2}>
        {job.description}
      </Text>
      <View style={styles.metaRow}>
        {job.location && (
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={14} color="#666" />
            <Text style={styles.metaText}>
              {typeof job.location === "string"
                ? job.location
                : job.location &&
                  typeof job.location === "object" &&
                  "address" in job.location &&
                  job.location.address
                ? job.location.address
                : "Unknown location"}
            </Text>
          </View>
        )}
        {job.category && (
          <View style={styles.metaItem}>
            <Ionicons name="pricetag-outline" size={14} color="#666" />
            <Text style={styles.metaText}>{job.category}</Text>
          </View>
        )}
      </View>
      <View style={styles.footerRow}>
        <View style={styles.posterRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{avatarLetter}</Text>
          </View>
          <Text style={styles.posterName}>
            {firstName} {lastName}
          </Text>
        </View>
        <View style={[styles.statusBadge, getStatusBadgeStyle(job.status)]}>
          <Text style={[styles.statusText, getStatusTextStyle(job.status)]}>
            {typeof job.status === "string"
              ? job.status.replace("_", " ")
              : "Unknown"}
          </Text>
        </View>
      </View>
      {job.tags && job.tags.length > 0 && (
        <View style={styles.tagsRow}>
          {job.tags.slice(0, 3).map((tag, idx) => (
            <View key={idx} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
          {job.tags.length > 3 && (
            <Text style={styles.moreTagsText}>+{job.tags.length - 3}</Text>
          )}
        </View>
      )}
      <TouchableOpacity style={styles.detailsButton} onPress={onPress}>
        <Text style={styles.detailsButtonText}>Job details</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    flex: 1,
    marginRight: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2A9D8F",
  },
  description: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  metaText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  posterRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#2A9D8F",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  avatarText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  posterName: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    marginTop: 8,
  },
  tag: {
    backgroundColor: "#F1F7F6",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 11,
    color: "#2A9D8F",
    fontWeight: "500",
  },
  moreTagsText: {
    fontSize: 11,
    color: "#666",
    fontStyle: "italic",
  },
  detailsButton: {
    backgroundColor: "#2A9D8F",
    paddingVertical: 10,
    borderRadius: 4,
    alignItems: "center",
    marginTop: 10,
  },
  detailsButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default JobCard;
