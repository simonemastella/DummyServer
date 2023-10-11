import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecs_patterns from "aws-cdk-lib/aws-ecs-patterns";
import * as kms from 'aws-cdk-lib/aws-kms';

export class CdkStack extends cdk.Stack {
  readonly serverRepository: ecr.IRepository;
  readonly vpc: ec2.Vpc;
  readonly routetable: ec2.CfnRouteTable;
  readonly cluster: ecs.Cluster;
  readonly kmsKey: kms.Key;
  readonly ecsSecurityGroup: ec2.SecurityGroup;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.serverRepository = new ecr.Repository(this, "serverdummy", {
      repositoryName: "serverdummy",
    });

    this.vpc = new ec2.Vpc(this, "MyVpc", {
      cidr: "10.0.0.0/16",
      maxAzs: 2,
      natGateways: 1,
      subnetConfiguration: [
        {
          subnetType: ec2.SubnetType.PUBLIC,
          name: "serverdummy-PublicSubnet1",
          cidrMask: 24,
        },
        {
          subnetType: ec2.SubnetType.PUBLIC,
          name: "serverdummy-PublicSubnet2",
          cidrMask: 24,
        },
        {
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
          name: "serverdummy-PrivateSubnet1",
          cidrMask: 24,
        },
        {
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
          name: "serverdummy-PrivateSubnet2",
          cidrMask: 24,
        },
      ],
    });

    this.routetable = new ec2.CfnRouteTable(this, "serverdummy-RouteTable", {
      vpcId: this.vpc.vpcId,
    });

    this.cluster = new ecs.Cluster(this, "serverdummy-Cluster", {
      vpc: this.vpc
    });

    // Create a load-balanced Fargate service and make it public
    new ecs_patterns.ApplicationLoadBalancedFargateService(this, "serverdummy-ALB", {
      cluster: this.cluster, // Required
    });

    //create security groups
    this.ecsSecurityGroup = new ec2.SecurityGroup(this, 'serverdummy-ECSSecurityGroup', {
      vpc: this.vpc,
      securityGroupName: 'serverdummy-ECSSecurityGroup',
      description: 'Security group for ECS instances of serverdummy',
    });

    // Allow incoming traffic on port 80 (HTTP) and 443 (HTTPS) for ECS instances
    this.ecsSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'Allow HTTP traffic');
    this.ecsSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(443), 'Allow HTTPS traffic');

    this.kmsKey = new kms.Key(this, 'serverdummy-KmsKey', {
      description: 'KMS Key of serverdummy',
      enableKeyRotation: false,
    });    
  }
}
