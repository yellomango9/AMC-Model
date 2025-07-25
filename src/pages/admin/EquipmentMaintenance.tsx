import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import ModernChart from "@/components/charts/ModernChart";
import {
  Wrench,
  Plus,
  Search,
  Filter,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Monitor,
  Server,
  Cpu,
  HardDrive,
  Wifi,
  Camera,
  Printer,
  Trash2,
  Edit,
} from "lucide-react";
import { format, addDays, differenceInDays } from "date-fns";

interface Equipment {
  id: string;
  name: string;
  type: string;
  model: string;
  serialNumber: string;
  location: string;
  status: "operational" | "maintenance" | "faulty";
  lastServiceDate: string;
  nextServiceDate: string;
  installDate: string;
  warranty: string;
  serviceHistory: ServiceRecord[];
}

interface ServiceRecord {
  id: string;
  date: string;
  type: "routine" | "repair" | "replacement" | "upgrade";
  description: string;
  technician: string;
  cost?: number;
  partsUsed?: string[];
  duration: number; // in hours
}

const EquipmentMaintenance = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [isAddEquipmentDialogOpen, setIsAddEquipmentDialogOpen] = useState(false);
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
  const [isServiceHistoryDialogOpen, setIsServiceHistoryDialogOpen] = useState(false);
  const [isEditEquipmentDialogOpen, setIsEditEquipmentDialogOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [equipment, setEquipment] = useState<Equipment[]>([]);

  // Initialize equipment data
  useEffect(() => {
    const storedEquipment = localStorage.getItem("amc_equipment");
    if (storedEquipment) {
      try {
        setEquipment(JSON.parse(storedEquipment));
      } catch {
        setEquipment(getInitialEquipment());
      }
    } else {
      setEquipment(getInitialEquipment());
    }
  }, []);

  // Save equipment data whenever it changes
  useEffect(() => {
    if (equipment.length > 0) {
      localStorage.setItem("amc_equipment", JSON.stringify(equipment));
    }
  }, [equipment]);

  const getInitialEquipment = (): Equipment[] => [
    {
      id: "eq-001",
      name: "Main Server Rack",
      type: "Server",
      model: "Dell PowerEdge R750",
      serialNumber: "DL-R750-001",
      location: "Server Room A",
      status: "operational",
      lastServiceDate: "2024-01-10",
      nextServiceDate: "2024-04-10",
      installDate: "2023-06-01",
      warranty: "2026-06-01",
      serviceHistory: [
        {
          id: "sr-001",
          date: "2024-01-10",
          type: "routine",
          description: "Quarterly maintenance and cleaning",
          technician: "John Doe",
          
          duration: 2,
        },
      ],
    },
    {
      id: "eq-002",
      name: "Network Switch Core",
      type: "Network",
      model: "Cisco Catalyst 2960",
      serialNumber: "CS-2960-001",
      location: "Server Room A",
      status: "operational",
      lastServiceDate: "2024-01-15",
      nextServiceDate: "2024-07-15",
      installDate: "2023-05-15",
      warranty: "2026-05-15",
      serviceHistory: [],
    },
    {
      id: "eq-003",
      name: "Surveillance Camera #1",
      type: "Security",
      model: "Hikvision DS-2CD2143G0",
      serialNumber: "HK-2143-001",
      location: "Main Entrance",
      status: "maintenance",
      lastServiceDate: "2024-01-20",
      nextServiceDate: "2024-03-20",
      installDate: "2023-04-01",
      warranty: "2025-04-01",
      serviceHistory: [
        {
          id: "sr-002",
          date: "2024-01-20",
          type: "repair",
          description: "Lens cleaning and adjustment",
          technician: "Jane Smith",
       
          duration: 1,
        },
      ],
    },
    {
      id: "eq-004",
      name: "UPS Unit Main",
      type: "Power",
      model: "APC Smart-UPS 3000",
      serialNumber: "APC-3000-001",
      location: "Server Room A",
      status: "faulty",
      lastServiceDate: "2023-12-01",
      nextServiceDate: "2024-02-01",
      installDate: "2023-03-01",
      warranty: "2025-03-01",
      serviceHistory: [
        {
          id: "sr-003",
          date: "2023-12-01",
          type: "replacement",
          description: "Battery replacement",
          technician: "Mike Johnson",
         
          partsUsed: ["UPS Battery Pack"],
          duration: 3,
        },
      ],
    },
    {
      id: "eq-005",
      name: "Office Printer Main",
      type: "Peripheral",
      model: "HP LaserJet Pro 4301",
      serialNumber: "HP-4301-001",
      location: "Office Floor 1",
      status: "operational",
      lastServiceDate: "2024-01-05",
      nextServiceDate: "2024-04-05",
      installDate: "2023-08-01",
      warranty: "2025-08-01",
      serviceHistory: [],
    },
  ];

  const [newEquipment, setNewEquipment] = useState({
    name: "",
    type: "",
    model: "",
    serialNumber: "",
    location: "",
    installDate: "",
    warranty: "",
  });

  const [newService, setNewService] = useState({
    type: "routine" as "routine" | "repair" | "replacement" | "upgrade",
    description: "",
    technician: "",
    
    duration: "",
    nextServiceDate: "",
  });

  // Get unique locations for filter
  const locations = Array.from(new Set(equipment.map(eq => eq.location)));

  // Filter equipment with improved filtering
  const filteredEquipment = equipment.filter((equipment) => {
    const matchesSearch =
      equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipment.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipment.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipment.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || equipment.type.toLowerCase() === selectedType.toLowerCase();
    const matchesStatus = selectedStatus === "all" || equipment.status === selectedStatus;
    const matchesLocation = selectedLocation === "all" || equipment.location === selectedLocation;
    return matchesSearch && matchesType && matchesStatus && matchesLocation;
  });

  // Calculate statistics
  const totalEquipment = equipment.length;
  const operationalCount = equipment.filter((e) => e.status === "operational").length;
  const maintenanceCount = equipment.filter((e) => e.status === "maintenance").length;
  const faultyCount = equipment.filter((e) => e.status === "faulty").length;
  const dueSoonCount = equipment.filter((e) => {
    const daysUntilService = differenceInDays(new Date(e.nextServiceDate), new Date());
    return daysUntilService <= 7 && daysUntilService >= 0;
  }).length;

  const getEquipmentIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "server":
        return <Server className="h-5 w-5" />;
      case "network":
        return <Wifi className="h-5 w-5" />;
      case "security":
        return <Camera className="h-5 w-5" />;
      case "peripheral":
        return <Printer className="h-5 w-5" />;
      case "power":
        return <HardDrive className="h-5 w-5" />;
      default:
        return <Monitor className="h-5 w-5" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "operational":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Operational
          </Badge>
        );
      case "maintenance":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            Maintenance
          </Badge>
        );
      case "faulty":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            Faulty
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getDaysUntilService = (nextServiceDate: string) => {
    return differenceInDays(new Date(nextServiceDate), new Date());
  };

  const handleAddEquipment = () => {
    if (!newEquipment.name || !newEquipment.type || !newEquipment.model) {
      alert("Please fill in all required fields");
      return;
    }

    const equipmentToAdd: Equipment = {
      id: `eq-${Date.now()}`,
      name: newEquipment.name,
      type: newEquipment.type,
      model: newEquipment.model,
      serialNumber: newEquipment.serialNumber,
      location: newEquipment.location,
      status: "operational",
      lastServiceDate: new Date().toISOString().split('T')[0],
      nextServiceDate: addDays(new Date(), 90).toISOString().split('T')[0],
      installDate: newEquipment.installDate || new Date().toISOString().split('T')[0],
      warranty: newEquipment.warranty || addDays(new Date(), 365).toISOString().split('T')[0],
      serviceHistory: [],
    };

    setEquipment(prev => [...prev, equipmentToAdd]);
    setIsAddEquipmentDialogOpen(false);
    setNewEquipment({
      name: "",
      type: "",
      model: "",
      serialNumber: "",
      location: "",
      installDate: "",
      warranty: "",
    });
  };

  const handleServiceRecord = () => {
    if (!selectedEquipment || !newService.description || !newService.technician) {
      alert("Please fill in all required fields");
      return;
    }

    const serviceRecord: ServiceRecord = {
      id: `sr-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type: newService.type,
      description: newService.description,
      technician: newService.technician,
   
      duration: newService.duration ? parseFloat(newService.duration) : 0,
    };

    const updatedEquipment = equipment.map(eq => {
      if (eq.id === selectedEquipment.id) {
        return {
          ...eq,
          lastServiceDate: new Date().toISOString().split('T')[0],
          nextServiceDate: newService.nextServiceDate || addDays(new Date(), 90).toISOString().split('T')[0],
          serviceHistory: [...eq.serviceHistory, serviceRecord],
          status: newService.type === "repair" || newService.type === "replacement" ? "operational" : eq.status,
        };
      }
      return eq;
    });

    setEquipment(updatedEquipment);
    setIsServiceDialogOpen(false);
    setSelectedEquipment(null);
    setNewService({
      type: "routine",
      description: "",
      technician: "",
     
      duration: "",
      nextServiceDate: "",
    });
  };

  const handleDeleteEquipment = (equipmentId: string) => {
    if (confirm("Are you sure you want to delete this equipment?")) {
      setEquipment(prev => prev.filter(eq => eq.id !== equipmentId));
    }
  };

  const handleUpdateStatus = (equipmentId: string, newStatus: "operational" | "maintenance" | "faulty") => {
    setEquipment(prev => prev.map(eq => 
      eq.id === equipmentId ? { ...eq, status: newStatus } : eq
    ));
  };

  // Chart data for equipment status distribution
  const statusChartData = {
    labels: ["Operational", "Maintenance", "Faulty"],
    datasets: [
      {
        label: "Equipment Status",
        data: [operationalCount, maintenanceCount, faultyCount],
        backgroundColor: ["#10b981", "#f59e0b", "#ef4444"],
        borderWidth: 2,
        borderColor: "#ffffff",
      },
    ],
  };

  // Chart data for service costs over time
  const serviceCostData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Service Costs (₹)",
        data: [1200, 800, 1500, 600, 900, 1100],
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Equipment Maintenance
          </h1>
          <p className="text-gray-600 mt-1">
            Manage and track all equipment maintenance activities
          </p>
        </div>
        <div className="flex gap-3">
          <Dialog
            open={isAddEquipmentDialogOpen}
            onOpenChange={setIsAddEquipmentDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Equipment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Equipment</DialogTitle>
                <DialogDescription>
                  Register new equipment in the maintenance system.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Equipment Name *</Label>
                  <Input
                    id="name"
                    value={newEquipment.name}
                    onChange={(e) =>
                      setNewEquipment((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="Equipment name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type *</Label>
                  <Select
                    onValueChange={(value) =>
                      setNewEquipment((prev) => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Server">Server</SelectItem>
                      <SelectItem value="Network">Network</SelectItem>
                      <SelectItem value="Security">Security</SelectItem>
                      <SelectItem value="Peripheral">Peripheral</SelectItem>
                      <SelectItem value="Power">Power</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Model *</Label>
                  <Input
                    id="model"
                    value={newEquipment.model}
                    onChange={(e) =>
                      setNewEquipment((prev) => ({
                        ...prev,
                        model: e.target.value,
                      }))
                    }
                    placeholder="Equipment model"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="serialNumber">Serial Number</Label>
                  <Input
                    id="serialNumber"
                    value={newEquipment.serialNumber}
                    onChange={(e) =>
                      setNewEquipment((prev) => ({
                        ...prev,
                        serialNumber: e.target.value,
                      }))
                    }
                    placeholder="Serial number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={newEquipment.location}
                    onChange={(e) =>
                      setNewEquipment((prev) => ({
                        ...prev,
                        location: e.target.value,
                      }))
                    }
                    placeholder="Installation location"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="installDate">Install Date</Label>
                  <Input
                    id="installDate"
                    type="date"
                    value={newEquipment.installDate}
                    onChange={(e) =>
                      setNewEquipment((prev) => ({
                        ...prev,
                        installDate: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="warranty">Warranty Expiry</Label>
                  <Input
                    id="warranty"
                    type="date"
                    value={newEquipment.warranty}
                    onChange={(e) =>
                      setNewEquipment((prev) => ({
                        ...prev,
                        warranty: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddEquipmentDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddEquipment}>Add Equipment</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Equipment
            </CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEquipment}</div>
            <p className="text-xs text-muted-foreground">Managed devices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Operational</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {operationalCount}
            </div>
            <Progress
              value={(operationalCount / totalEquipment) * 100}
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              In Maintenance
            </CardTitle>
            <Wrench className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {maintenanceCount}
            </div>
            <p className="text-xs text-muted-foreground">Under service</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faulty</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{faultyCount}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Service Due</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {dueSoonCount}
            </div>
            <p className="text-xs text-muted-foreground">Within 7 days</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="equipment" className="space-y-4">
        <TabsList>
          <TabsTrigger value="equipment">Equipment List</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="schedule">Service Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="equipment" className="space-y-4">
          {/* Enhanced Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters & Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label>Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search equipment..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="server">Server</SelectItem>
                      <SelectItem value="network">Network</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                      <SelectItem value="peripheral">Peripheral</SelectItem>
                      <SelectItem value="power">Power</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={selectedStatus}
                    onValueChange={setSelectedStatus}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="operational">Operational</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="faulty">Faulty</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Select
                    value={selectedLocation}
                    onValueChange={setSelectedLocation}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      {locations.map(location => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedType("all");
                      setSelectedStatus("all");
                      setSelectedLocation("all");
                    }}
                    className="w-full"
                  >
                    Reset Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Equipment List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredEquipment.map((equipment) => {
              const daysUntilService = getDaysUntilService(
                equipment.nextServiceDate,
              );
              const isServiceDue =
                daysUntilService <= 7 && daysUntilService >= 0;

              return (
                <Card
                  key={equipment.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {getEquipmentIcon(equipment.type)}
                        <div>
                          <CardTitle className="text-lg">
                            {equipment.name}
                          </CardTitle>
                          <CardDescription>{equipment.model}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(equipment.status)}
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleUpdateStatus(equipment.id, "operational")}
                            className="h-6 w-6 p-0"
                          >
                            <CheckCircle className="h-3 w-3 text-green-600" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleUpdateStatus(equipment.id, "maintenance")}
                            className="h-6 w-6 p-0"
                          >
                            <Wrench className="h-3 w-3 text-yellow-600" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleUpdateStatus(equipment.id, "faulty")}
                            className="h-6 w-6 p-0"
                          >
                            <AlertTriangle className="h-3 w-3 text-red-600" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteEquipment(equipment.id)}
                            className="h-6 w-6 p-0"
                          >
                            <Trash2 className="h-3 w-3 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Type:</span>
                        <p className="font-medium">{equipment.type}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Location:</span>
                        <p className="font-medium">{equipment.location}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Serial:</span>
                        <p className="font-medium text-xs">
                          {equipment.serialNumber}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Last Service:</span>
                        <p className="font-medium text-xs">
                          {format(
                            new Date(equipment.lastServiceDate),
                            "MMM dd, yyyy",
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="border-t pt-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Next Service:</span>
                        <span
                          className={`font-medium ${isServiceDue ? "text-orange-600" : "text-gray-900"}`}
                        >
                          {format(
                            new Date(equipment.nextServiceDate),
                            "MMM dd, yyyy",
                          )}
                        </span>
                      </div>
                      {isServiceDue && (
                        <div className="mt-2 p-2 bg-orange-50 rounded text-xs text-orange-800">
                          ⚠️ Service due in {daysUntilService} day
                          {daysUntilService !== 1 ? "s" : ""}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          setSelectedEquipment(equipment);
                          setIsServiceDialogOpen(true);
                        }}
                      >
                        <Wrench className="mr-2 h-4 w-4" />
                        Service
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          setSelectedEquipment(equipment);
                          setIsServiceHistoryDialogOpen(true);
                        }}
                      >
                        <Clock className="mr-2 h-4 w-4" />
                        History
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ModernChart
              type="doughnut"
              title="Equipment Status Distribution"
              description="Current status of all equipment"
              data={statusChartData}
            />

            <ModernChart
              type="line"
              title="Service Costs Trend"
              description="Monthly maintenance costs over time"
              data={serviceCostData}
            />
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Service Schedule</CardTitle>
              <CardDescription>
                Equipment due for maintenance in the next 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {equipment
                  .filter((eq) => {
                    const days = getDaysUntilService(eq.nextServiceDate);
                    return days >= 0 && days <= 30;
                  })
                  .sort(
                    (a, b) =>
                      getDaysUntilService(a.nextServiceDate) -
                      getDaysUntilService(b.nextServiceDate),
                  )
                  .map((equipment) => {
                    const daysUntil = getDaysUntilService(
                      equipment.nextServiceDate,
                    );
                    return (
                      <div
                        key={equipment.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {getEquipmentIcon(equipment.type)}
                          <div>
                            <p className="font-medium">{equipment.name}</p>
                            <p className="text-sm text-gray-600">
                              {equipment.location}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {format(
                              new Date(equipment.nextServiceDate),
                              "MMM dd, yyyy",
                            )}
                          </p>
                          <p
                            className={`text-xs ${daysUntil <= 7 ? "text-orange-600" : "text-gray-600"}`}
                          >
                            {daysUntil === 0
                              ? "Due today"
                              : `${daysUntil} days`}
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Service Dialog */}
      <Dialog open={isServiceDialogOpen} onOpenChange={setIsServiceDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Record Service Activity</DialogTitle>
            <DialogDescription>
              Log maintenance work performed on {selectedEquipment?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="serviceType">Service Type *</Label>
                <Select
                  value={newService.type}
                  onValueChange={(value: any) =>
                    setNewService((prev) => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="routine">Routine Maintenance</SelectItem>
                    <SelectItem value="repair">Repair</SelectItem>
                    <SelectItem value="replacement">Replacement</SelectItem>
                    <SelectItem value="upgrade">Upgrade</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="technician">Technician *</Label>
                <Input
                  id="technician"
                  value={newService.technician}
                  onChange={(e) =>
                    setNewService((prev) => ({
                      ...prev,
                      technician: e.target.value,
                    }))
                  }
                  placeholder="Technician name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Service Description *</Label>
              <Textarea
                id="description"
                value={newService.description}
                onChange={(e) =>
                  setNewService((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Describe the service performed..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                
                <Input
                  id="duration"
                  type="number"
                  value={newService.duration}
                  onChange={(e) =>
                    setNewService((prev) => ({
                      ...prev,
                      duration: e.target.value,
                    }))
                  }
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nextService">Next Service Date</Label>
                <Input
                  id="nextService"
                  type="date"
                  value={newService.nextServiceDate}
                  onChange={(e) =>
                    setNewService((prev) => ({
                      ...prev,
                      nextServiceDate: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsServiceDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleServiceRecord}>Record Service</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Service History Dialog */}
      <Dialog open={isServiceHistoryDialogOpen} onOpenChange={setIsServiceHistoryDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[600px] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Service History - {selectedEquipment?.name}</DialogTitle>
            <DialogDescription>
              Complete service history for {selectedEquipment?.model} ({selectedEquipment?.serialNumber})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedEquipment?.serviceHistory && selectedEquipment.serviceHistory.length > 0 ? (
              <div className="space-y-4">
                {selectedEquipment.serviceHistory
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((service) => (
                    <Card key={service.id} className="border-l-4 border-l-blue-500">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  service.type === "routine"
                                    ? "default"
                                    : service.type === "repair"
                                    ? "destructive"
                                    : service.type === "replacement"
                                    ? "secondary"
                                    : "outline"
                                }
                              >
                                {service.type.charAt(0).toUpperCase() + service.type.slice(1)}
                              </Badge>
                              <span className="text-sm text-gray-600">
                                {format(new Date(service.date), "MMM dd, yyyy")}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{service.technician}</p>
                            <p className="text-xs text-gray-600">{service.duration} hours</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <p className="text-sm font-medium">Description:</p>
                          <p className="text-sm text-gray-700">{service.description}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                          
                            
                          </div>
                          <div>
                            <span className="text-gray-600">Duration:</span>
                            <p className="font-medium">{service.duration} hours</p>
                          </div>
                          {service.partsUsed && service.partsUsed.length > 0 && (
                            <div className="col-span-2">
                              <span className="text-gray-600">Parts Used:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {service.partsUsed.map((part, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {part}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Service History</h3>
                <p className="text-gray-600">
                  No service records found for this equipment. Service history will appear here once maintenance work is recorded.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsServiceHistoryDialogOpen(false)}
            >
              Close
            </Button>
            <Button
              onClick={() => {
                setIsServiceHistoryDialogOpen(false);
                setIsServiceDialogOpen(true);
              }}
            >
              <Wrench className="mr-2 h-4 w-4" />
              Add Service Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EquipmentMaintenance;
